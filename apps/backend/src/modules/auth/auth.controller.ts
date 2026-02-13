import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

const REFRESH_TOKEN_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress =
      req.headers['x-forwarded-for']?.toString() ?? req.ip;

    const { accessToken, refreshToken } = await this.authService.login(
      dto,
      userAgent,
      ipAddress,
    );

    res.setCookie(REFRESH_TOKEN_COOKIE, refreshToken, COOKIE_OPTIONS);

    return { accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 없습니다.');
    }

    const userAgent = req.headers['user-agent'];
    const ipAddress =
      req.headers['x-forwarded-for']?.toString() ?? req.ip;

    const tokens = await this.authService.refresh(
      refreshToken,
      userAgent,
      ipAddress,
    );

    res.setCookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);

    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });

    return { message: '로그아웃 되었습니다.' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '모든 세션 로그아웃' })
  @ApiResponse({ status: 200, description: '모든 세션 로그아웃 성공' })
  async logoutAll(
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    await this.authService.logoutAll(userId);

    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });

    return { message: '모든 기기에서 로그아웃 되었습니다.' };
  }
}
