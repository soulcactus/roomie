import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly roomSelect = {
    id: true,
    name: true,
    location: true,
    capacity: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.RoomSelect;

  async create(dto: CreateRoomDto, userId: string) {
    const room = await this.prisma.room.create({
      data: {
        name: dto.name,
        location: dto.location,
        capacity: dto.capacity,
      },
      select: this.roomSelect,
    });

    // 감사 로그
    await this.prisma.auditLog.create({
      data: {
        action: 'ROOM_CREATED',
        entityType: 'Room',
        entityId: room.id,
        userId,
        metadata: { name: room.name },
      },
    });

    return room;
  }

  async findAll(page = 1, limit = 20, includeInactive = false) {
    const skip = (page - 1) * limit;

    const where = includeInactive ? {} : { isActive: true };

    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        skip,
        take: limit,
        select: this.roomSelect,
        orderBy: { name: 'asc' },
      }),
      this.prisma.room.count({ where }),
    ]);

    return {
      data: rooms,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      select: this.roomSelect,
    });

    if (!room) {
      throw new NotFoundException('회의실을 찾을 수 없습니다.');
    }

    return room;
  }

  async update(id: string, dto: UpdateRoomDto, userId: string) {
    await this.findById(id); // 존재 여부 확인

    const room = await this.prisma.room.update({
      where: { id },
      data: dto,
      select: this.roomSelect,
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'ROOM_UPDATED',
        entityType: 'Room',
        entityId: room.id,
        userId,
        metadata: { changes: dto as unknown as Prisma.InputJsonObject },
      },
    });

    return room;
  }

  async delete(id: string, userId: string) {
    await this.findById(id);

    // Soft delete: isActive를 false로 변경
    const room = await this.prisma.room.update({
      where: { id },
      data: { isActive: false },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'ROOM_DELETED',
        entityType: 'Room',
        entityId: room.id,
        userId,
      },
    });

    return { message: '회의실이 비활성화되었습니다.' };
  }
}
