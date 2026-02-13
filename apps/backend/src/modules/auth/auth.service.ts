import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  async login(
    dto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    return this.generateTokens(user.id, user.email, user.role, {
      userAgent,
      ipAddress,
    });
  }

  async refresh(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthTokens> {
    let payload: RefreshTokenPayload;
    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(refreshToken, {
        secret: this.getJwtSecret(),
      });
    } catch {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    const tokenHash = this.hashToken(refreshToken);

    const session = await this.prisma.session.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
    if (session.user.id !== payload.sub) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    // Refresh Token Rotation: 기존 세션 삭제
    await this.prisma.session.delete({ where: { id: session.id } });

    // 새 토큰 발급
    return this.generateTokens(
      session.user.id,
      session.user.email,
      session.user.role,
      { userAgent, ipAddress },
    );
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);

    await this.prisma.session.deleteMany({
      where: { tokenHash },
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    meta: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthTokens> {
    const payload: TokenPayload = { sub: userId, email, role };

    // Access Token 생성
    const accessToken = this.jwtService.sign(payload);

    // Refresh Token 생성 (JWT)
    const refreshExpiresIn = this.getRefreshExpiresIn();
    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      {
        secret: this.getJwtSecret(),
        expiresIn: refreshExpiresIn,
      },
    );
    const refreshTokenHash = this.hashToken(refreshToken);

    // 리프레시 토큰 만료 시간 계산
    const expiresAt = this.calculateExpiry(refreshExpiresIn);

    // DB에 세션 저장 (해시값만)
    await this.prisma.session.create({
      data: {
        userId,
        tokenHash: refreshTokenHash,
        expiresAt,
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private getJwtSecret() {
    return this.configService.get<string>(
      'jwt.secret',
      'default-secret-change-in-production',
    );
  }

  private getRefreshExpiresIn() {
    return this.configService.get<string>('jwt.refreshExpiresIn', '14d');
  }

  private calculateExpiry(duration: string): Date {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 기본 14일
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
  }
}
