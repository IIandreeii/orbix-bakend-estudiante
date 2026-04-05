import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { UserPayload } from '../decorators/current-user.decorator';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
} from '../dtos/auth-extra.dto';

import { LoginUseCase } from '../../../core/application/use-cases/auth/login.use-case';
import { RegisterUseCase } from '../../../core/application/use-cases/auth/register.use-case';
import { RefreshTokenUseCase } from '../../../core/application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../../../core/application/use-cases/auth/logout.use-case';
import { ForgotPasswordUseCase } from '../../../core/application/use-cases/auth/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../../core/application/use-cases/auth/reset-password.use-case';
import { VerifyEmailUseCase } from '../../../core/application/use-cases/auth/verify-email.use-case';
import { ResendVerificationUseCase } from '../../../core/application/use-cases/auth/resend-verification.use-case';
import { GetProfileUseCase } from '../../../core/application/use-cases/auth/get-profile.use-case';
import { UpdateProfileUseCase } from '../../../core/application/use-cases/auth/update-profile.use-case';
import { UpdateProfileDto } from '../dtos/auth/update-profile.dto';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  MessageResponseDto,
  UserResponseDto,
  ErrorResponseDto,
} from '../dtos/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationUseCase: ResendVerificationUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Si el usuario existe, se enviará un correo',
    type: MessageResponseDto,
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.forgotPasswordUseCase.execute(dto.email);
    return {
      message: 'Si el correo existe, se ha enviado un enlace de recuperación.',
    };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña usando token' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida con éxito',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
    type: ErrorResponseDto,
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.resetPasswordUseCase.execute(dto);
    return { message: 'La contraseña ha sido restablecida con éxito.' };
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verificar correo del usuario usando token' })
  @ApiResponse({
    status: 200,
    description: 'Correo verificado con éxito',
    type: MessageResponseDto,
  })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.verifyEmailUseCase.execute(dto.email, dto.token);
    return { message: 'Correo verificado con éxito.' };
  }

  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Reenviar correo de verificación' })
  @ApiResponse({
    status: 200,
    description: 'Correo enviado con éxito',
    type: MessageResponseDto,
  })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.resendVerificationUseCase.execute(dto.email);
    return {
      message: 'Se ha reenviado el enlace de verificación a su correo.',
    };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refrescar access token usando cookie HTTP-only',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refrescado con éxito',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido',
    type: ErrorResponseDto,
  })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = (request.cookies as { 'refresh-token'?: string })[
      'refresh-token'
    ];
    if (!refreshToken) {
      throw new UnauthorizedException('Se requiere refresh token');
    }
    const { accessToken, refreshToken: newRefreshToken } =
      await this.refreshTokenUseCase.execute(refreshToken);

    response.cookie('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('refresh-token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Token refrescado' };
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado con éxito',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya existe',
    type: ErrorResponseDto,
  })
  async register(@Body() registerDto: RegisterDto): Promise<UserResponseDto> {
    return (await this.registerUseCase.execute(registerDto)) as UserResponseDto;
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Login de usuario con cookies HTTP-only',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Cuenta no verificada',
    type: ErrorResponseDto,
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, user, subscription } =
      await this.loginUseCase.execute(loginDto);

    response.cookie('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { user, subscription };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión de usuario (limpiar cookies)' })
  @ApiResponse({
    status: 200,
    description: 'Cierre de sesión exitoso',
    type: MessageResponseDto,
  })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = (request.cookies as { 'refresh-token'?: string })[
      'refresh-token'
    ];
    if (refreshToken) {
      await this.logoutUseCase.execute(refreshToken);
    }

    response.clearCookie('auth-token');
    response.clearCookie('refresh-token', { path: '/auth/refresh' });
    return { message: 'Sesión cerrada' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Datos del perfil',
    type: UserResponseDto,
  })
  async getProfile(@CurrentUser() user: UserPayload) {
    return await this.getProfileUseCase.execute(user.sub);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Actualizar perfil del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado con éxito',
    type: UserResponseDto,
  })
  async updateProfile(
    @CurrentUser() user: UserPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.updateProfileUseCase.execute({
      userId: user.sub,
      ...dto,
    });
    return updated.toJSON();
  }
}
