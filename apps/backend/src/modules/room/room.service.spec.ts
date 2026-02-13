import { NotFoundException } from '@nestjs/common';
import { RoomService } from './room.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('RoomService', () => {
  const prisma = {
    room: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  } as unknown as PrismaService;

  let service: RoomService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RoomService(prisma);
  });

  it('활성 회의실 목록을 페이지네이션으로 반환한다', async () => {
    prisma.room.findMany = jest.fn().mockResolvedValue([
      {
        id: 'r-1',
        name: '오로라',
        location: '본관 3층',
        capacity: 6,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    prisma.room.count = jest.fn().mockResolvedValue(1);

    const result = await service.findAll(1, 20, false);

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(prisma.room.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true },
        skip: 0,
        take: 20,
      }),
    );
  });

  it('존재하지 않는 회의실 조회 시 NotFoundException을 던진다', async () => {
    prisma.room.findUnique = jest.fn().mockResolvedValue(null);

    await expect(service.findById('missing-room')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

