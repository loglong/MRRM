import { Controller, Post, Body, Get, UseGuards, Request, Res, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Response, Request as ExpressRequest } from 'express';
import { AuthService, AuthResponse } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDtoSchema, RegisterDtoSchema, RegisterDto, LoginDto } from './dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 200, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Email already exists or validation failed' })
  async register(
    @Body(new ZodValidationPipe(RegisterDtoSchema)) dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const result = await this.authService.register(dto);

    // Set httpOnly cookie for refresh token (7 days)
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refresh_token', result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Body(new ZodValidationPipe(LoginDtoSchema)) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const result = await this.authService.login(dto);

    // Set httpOnly cookie for refresh token (7 days or extended if rememberMe)
    const isProduction = process.env.NODE_ENV === 'production';
    const maxAge = dto.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

    res.cookie('refresh_token', result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge,
    });

    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current user' })
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear the refresh token cookie
    res.clearCookie('refresh_token');
    return { success: true };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using httpOnly cookie' })
  async refresh(@Req() req: ExpressRequest) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return { accessToken: null };
    }
    // Validate and return new access token
    // In production, decode the refresh token and issue a new access token
    return { accessToken: refreshToken };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.sub);
  }

  @Post('authing/sso-url')
  @ApiOperation({ summary: 'Get Authing SSO login URL' })
  async getAuthingSSOUrl(): Promise<{ url: string }> {
    // Generate Authing SSO URL
    const appId = process.env.AUTHING_APP_ID;
    const redirectUri = encodeURIComponent(`${process.env.API_BASE_URL}/auth/authing/callback`);
    const url = `https://oauth.authing.cn/oauth/authorize?app_id=${appId}&redirect_uri=${redirectUri}&response_type=code`;
    return { url };
  }

  @Post('authing/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Authing SSO callback' })
  async authingCallback(@Body('code') code: string, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
    // Exchange code for tokens with Authing
    // For now, return a placeholder - actual implementation would call Authing API
    const result = await this.authService.ssoLogin(code);

    // Set httpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refresh_token', result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return result;
  }
}
