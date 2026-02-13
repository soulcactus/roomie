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
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

const REFRESH_TOKEN_COOKIE = 'refresh_token';
const ACCESS_TOKEN_COOKIE = 'access_token';
const IS_PROD = process.env.NODE_ENV === 'production';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
const COOKIE_SAME_SITE: 'lax' | 'none' = IS_PROD ? 'none' : 'lax';
type AuthRequest = {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  cookies: Record<string, string | undefined>;
};

type AuthResponse = {
  setCookie: (
    name: string,
    value: string,
    options: Record<string, unknown>,
  ) => void;
  clearCookie: (name: string, options: Record<string, unknown>) => void;
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: COOKIE_SAME_SITE,
  path: '/',
  ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
};

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: IS_PROD,
  sameSite: COOKIE_SAME_SITE,
  path: '/',
  ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const CLEAR_COOKIE_BASE = {
  secure: IS_PROD,
  sameSite: COOKIE_SAME_SITE,
  path: '/',
  ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  expires: new Date(0),
};

function expireCookieAllVariants(
  res: AuthResponse,
  cookieName: string,
  httpOnly: boolean,
) {
  const domains = COOKIE_DOMAIN ? [undefined, COOKIE_DOMAIN] : [undefined];
  const sameSites: Array<'lax' | 'strict' | 'none'> = ['lax', 'strict', 'none'];
  const secures = [false, true];

  for (const domain of domains) {
    for (const sameSite of sameSites) {
      for (const secure of secures) {
        // sameSite=none은 secure=true여야 브라우저가 수용
        if (sameSite === 'none' && !secure) continue;

        const options = {
          path: '/',
          httpOnly,
          sameSite,
          secure,
          expires: new Date(0),
          maxAge: 0,
          ...(domain ? { domain } : {}),
        };

        res.clearCookie(cookieName, options);
        res.setCookie(cookieName, '', options);
      }
    }
  }
}

function clearAuthCookies(res: AuthResponse) {
  // 표준 옵션으로 우선 삭제
  res.clearCookie(REFRESH_TOKEN_COOKIE, { ...CLEAR_COOKIE_BASE, httpOnly: true });
  res.clearCookie(ACCESS_TOKEN_COOKIE, { ...CLEAR_COOKIE_BASE, httpOnly: false });
  res.setCookie(REFRESH_TOKEN_COOKIE, '', {
    ...CLEAR_COOKIE_BASE,
    httpOnly: true,
    maxAge: 0,
  });
  res.setCookie(ACCESS_TOKEN_COOKIE, '', {
    ...CLEAR_COOKIE_BASE,
    httpOnly: false,
    maxAge: 0,
  });

  // 과거 옵션으로 저장된 쿠키까지 제거
  expireCookieAllVariants(res, REFRESH_TOKEN_COOKIE, true);
  expireCookieAllVariants(res, ACCESS_TOKEN_COOKIE, false);
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일' })
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return { data: user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: AuthResponse,
  ) {
    const userAgent = Array.isArray(req.headers['user-agent'])
      ? req.headers['user-agent'][0]
      : req.headers['user-agent'];
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor ?? req.ip;

    const { accessToken, refreshToken } = await this.authService.login(
      dto,
      userAgent,
      ipAddress,
    );

    res.setCookie(REFRESH_TOKEN_COOKIE, refreshToken, COOKIE_OPTIONS);
    res.setCookie(ACCESS_TOKEN_COOKIE, accessToken, ACCESS_COOKIE_OPTIONS);

    return { data: { accessToken } };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  async refresh(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: AuthResponse,
  ) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 없습니다.');
    }

    const userAgent = Array.isArray(req.headers['user-agent'])
      ? req.headers['user-agent'][0]
      : req.headers['user-agent'];
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor ?? req.ip;

    const tokens = await this.authService.refresh(
      refreshToken,
      userAgent,
      ipAddress,
    );

    res.setCookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
    res.setCookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, ACCESS_COOKIE_OPTIONS);

    return { data: { accessToken: tokens.accessToken } };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: AuthResponse,
  ) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    clearAuthCookies(res);

    return { data: { message: '로그아웃 되었습니다.' } };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '모든 세션 로그아웃' })
  @ApiResponse({ status: 200, description: '모든 세션 로그아웃 성공' })
  async logoutAll(
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) res: AuthResponse,
  ) {
    await this.authService.logoutAll(userId);

    clearAuthCookies(res);

    return { data: { message: '모든 기기에서 로그아웃 되었습니다.' } };
  }
}
