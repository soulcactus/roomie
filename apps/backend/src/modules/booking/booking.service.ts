import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 예약 생성
   *
   * PostgreSQL EXCLUDE 제약이 시간 충돌을 차단함.
   * 제약 위반 시 ConflictException(409) 반환.
   */
  async create(dto: CreateBookingDto, userId: string) {
    // 회의실 존재 및 활성 상태 확인
    const room = await this.prisma.room.findUnique({
      where: { id: dto.roomId },
    });

    if (!room) {
      throw new NotFoundException('회의실을 찾을 수 없습니다.');
    }

    if (!room.isActive) {
      throw new ConflictException('비활성화된 회의실입니다.');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const booking = await tx.booking.create({
          data: {
            roomId: dto.roomId,
            userId,
            title: dto.title,
            startAt: new Date(dto.startAt),
            endAt: new Date(dto.endAt),
          },
          include: {
            room: { select: { id: true, name: true } },
            user: { select: { id: true, name: true, email: true } },
          },
        });

        // 감사 로그
        await tx.auditLog.create({
          data: {
            action: 'BOOKING_CREATED',
            entityType: 'Booking',
            entityId: booking.id,
            userId,
            metadata: {
              roomId: dto.roomId,
              roomName: room.name,
              startAt: dto.startAt,
              endAt: dto.endAt,
            },
          },
        });

        return booking;
      });
    } catch (error) {
      if (this.isExclusionViolation(error)) {
        throw new ConflictException({
          code: 'BOOKING_CONFLICT',
          message: '해당 시간에 이미 예약이 존재합니다.',
        });
      }
      throw error;
    }
  }

  async findAll(filters: {
    roomId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { roomId, userId, startDate, endDate, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {
      status: 'CONFIRMED',
      ...(roomId && { roomId }),
      ...(userId && { userId }),
      ...(startDate && {
        startAt: { gte: new Date(startDate) },
      }),
      ...(endDate && {
        endAt: { lte: new Date(endDate) },
      }),
    };

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          room: { select: { id: true, name: true, location: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { startAt: 'asc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('예약을 찾을 수 없습니다.');
    }

    return booking;
  }

  async findByRoom(roomId: string, date: string) {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    return this.prisma.booking.findMany({
      where: {
        roomId,
        status: 'CONFIRMED',
        startAt: { gte: startOfDay },
        endAt: { lte: endOfDay },
      },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { startAt: 'asc' },
    });
  }

  async update(id: string, dto: UpdateBookingDto, userId: string) {
    const booking = await this.findById(id);

    // 본인 예약만 수정 가능 (관리자 제외는 Controller에서 처리)
    if (booking.userId !== userId) {
      throw new ForbiddenException('본인의 예약만 수정할 수 있습니다.');
    }

    if (booking.status === 'CANCELLED') {
      throw new ConflictException('취소된 예약은 수정할 수 없습니다.');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const updatedBooking = await tx.booking.update({
          where: { id },
          data: {
            ...(dto.title && { title: dto.title }),
            ...(dto.startAt && { startAt: new Date(dto.startAt) }),
            ...(dto.endAt && { endAt: new Date(dto.endAt) }),
          },
          include: {
            room: { select: { id: true, name: true } },
            user: { select: { id: true, name: true, email: true } },
          },
        });

        await tx.auditLog.create({
          data: {
            action: 'BOOKING_UPDATED',
            entityType: 'Booking',
            entityId: id,
            userId,
            metadata: { changes: dto as unknown as Prisma.InputJsonObject },
          },
        });

        return updatedBooking;
      });
    } catch (error) {
      if (this.isExclusionViolation(error)) {
        throw new ConflictException({
          code: 'BOOKING_CONFLICT',
          message: '해당 시간에 이미 예약이 존재합니다.',
        });
      }
      throw error;
    }
  }

  async cancel(id: string, userId: string) {
    const booking = await this.findById(id);

    if (booking.userId !== userId) {
      throw new ForbiddenException('본인의 예약만 취소할 수 있습니다.');
    }

    if (booking.status === 'CANCELLED') {
      throw new ConflictException('이미 취소된 예약입니다.');
    }

    return this.prisma.$transaction(async (tx) => {
      const cancelledBooking = await tx.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      await tx.auditLog.create({
        data: {
          action: 'BOOKING_CANCELLED',
          entityType: 'Booking',
          entityId: id,
          userId,
          metadata: {
            roomId: booking.roomId,
            startAt: booking.startAt,
            endAt: booking.endAt,
          },
        },
      });

      return { message: '예약이 취소되었습니다.', booking: cancelledBooking };
    });
  }

  /**
   * PostgreSQL EXCLUDE 제약 위반 에러 감지
   *
   * Prisma는 raw query 에러를 P2010으로 래핑하고,
   * exclusion violation 메시지를 포함함.
   */
  private isExclusionViolation(error: unknown): boolean {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2010: Raw query failed
      // P2002: Unique constraint failed (일부 케이스에서 사용)
      if (error.code === 'P2010' || error.code === 'P2002') {
        const message = error.message.toLowerCase();
        return (
          message.includes('exclusion') ||
          message.includes('conflicting') ||
          message.includes('booking_no_overlap')
        );
      }
    }

    // PostgreSQL 네이티브 에러 코드 체크
    if (error instanceof Error) {
      const pgError = error as { code?: string };
      // 23P01: exclusion_violation
      return pgError.code === '23P01';
    }

    return false;
  }
}
