import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('BookingService', () => {
  const tx = {
    user: { findMany: jest.fn() },
    booking: { create: jest.fn(), update: jest.fn() },
    bookingParticipant: { deleteMany: jest.fn(), createMany: jest.fn() },
    auditLog: { create: jest.fn() },
  };

  const prisma = {
    room: { findUnique: jest.fn() },
    booking: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn(),
  } as unknown as PrismaService;

  let service: BookingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BookingService(prisma);
    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback: (trx: typeof tx) => unknown) => callback(tx),
    );
  });

  it('존재하지 않는 회의실이면 예약 생성 시 NotFoundException을 던진다', async () => {
    prisma.room.findUnique = jest.fn().mockResolvedValue(null);

    await expect(
      service.create(
        {
          roomId: 'missing-room',
          title: '테스트',
          startAt: '2026-02-14T10:00:00.000Z',
          endAt: '2026-02-14T11:00:00.000Z',
        },
        'u-1',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('예약 생성 시 외부참석자를 정규화하고 참석자를 저장한다', async () => {
    prisma.room.findUnique = jest.fn().mockResolvedValue({
      id: 'r-1',
      name: '오로라',
      isActive: true,
    });
    tx.user.findMany.mockResolvedValue([{ id: 'u-1' }, { id: 'u-2' }]);
    tx.booking.create.mockResolvedValue({ id: 'b-1' });
    tx.auditLog.create.mockResolvedValue({ id: 'a-1' });

    await service.create(
      {
        roomId: 'r-1',
        title: '제품 회의',
        startAt: '2026-02-14T10:00:00.000Z',
        endAt: '2026-02-14T11:00:00.000Z',
        participantIds: ['u-2'],
        externalParticipants: ['외부참석자 1', ' 외부참석자 1 ', ''],
      },
      'u-1',
    );

    expect(tx.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          externalParticipants: ['외부참석자 1'],
          bookingParticipants: {
            createMany: {
              data: [{ userId: 'u-1' }, { userId: 'u-2' }],
              skipDuplicates: true,
            },
          },
        }),
      }),
    );
  });

  it('본인 예약이 아니면 수정 시 ForbiddenException을 던진다', async () => {
    prisma.booking.findUnique = jest.fn().mockResolvedValue({
      id: 'b-1',
      userId: 'u-owner',
      status: 'CONFIRMED',
    });

    await expect(
      service.update('b-1', { title: '변경' }, 'u-other'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('취소된 예약이면 수정 시 ConflictException을 던진다', async () => {
    prisma.booking.findUnique = jest.fn().mockResolvedValue({
      id: 'b-1',
      userId: 'u-1',
      status: 'CANCELLED',
    });

    await expect(
      service.update('b-1', { title: '변경' }, 'u-1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('수정 시 participantIds와 externalParticipants를 함께 갱신한다', async () => {
    prisma.booking.findUnique = jest.fn().mockResolvedValue({
      id: 'b-1',
      userId: 'u-1',
      status: 'CONFIRMED',
    });
    tx.user.findMany.mockResolvedValue([{ id: 'u-1' }, { id: 'u-3' }]);
    tx.booking.update.mockResolvedValue({ id: 'b-1' });
    tx.auditLog.create.mockResolvedValue({ id: 'a-1' });

    await service.update(
      'b-1',
      {
        participantIds: ['u-3'],
        externalParticipants: ['외부참석자 2', '외부참석자 2'],
      },
      'u-1',
    );

    expect(tx.bookingParticipant.deleteMany).toHaveBeenCalledWith({
      where: { bookingId: 'b-1', userId: { notIn: ['u-1', 'u-3'] } },
    });
    expect(tx.bookingParticipant.createMany).toHaveBeenCalledWith({
      data: [
        { bookingId: 'b-1', userId: 'u-1' },
        { bookingId: 'b-1', userId: 'u-3' },
      ],
      skipDuplicates: true,
    });
    expect(tx.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          externalParticipants: ['외부참석자 2'],
        }),
      }),
    );
  });
});

