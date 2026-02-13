import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    session: {
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  } as unknown as PrismaService;

  const jwtService = {
    sign: jest
      .fn()
      .mockImplementation((_payload: unknown, options?: unknown) =>
        options ? 'mock.refresh.token' : 'mock-access-token',
      ),
    verify: jest.fn(),
  } as unknown as JwtService;

  const configService = {
    get: jest.fn((_key: string, fallback?: string) => fallback),
  } as unknown as ConfigService;

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(prisma, jwtService, configService);
  });

  it('이미 존재하는 이메일이면 회원가입에서 ConflictException을 던진다', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 'u-1' });

    await expect(
      service.register({
        email: 'dup@roomie.com',
        password: 'password123',
        name: '중복',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('로그인 성공 시 access/refresh 토큰을 발급하고 세션을 저장한다', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue({
      id: 'u-1',
      email: 'user@roomie.com',
      password: 'hashed',
      role: 'USER',
    });
    prisma.session.create = jest.fn().mockResolvedValue({ id: 's-1' });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const result = await service.login({
      email: 'user@roomie.com',
      password: 'password123',
    });

    expect(result.accessToken).toBe('mock-access-token');
    expect(result.refreshToken.split('.')).toHaveLength(3);
    expect(prisma.session.create).toHaveBeenCalledTimes(1);
  });

  it('리프레시 토큰이 유효하지 않으면 UnauthorizedException을 던진다', async () => {
    (jwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid');
    });
    prisma.session.findFirst = jest.fn().mockResolvedValue(null);

    await expect(
      service.refresh('invalid-refresh-token'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
