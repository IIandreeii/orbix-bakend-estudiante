import { Controller, Post, Body, UseGuards, Query, Res } from '@nestjs/common';
import { CreatePaymentSessionUseCase } from '../../../core/application/use-cases/subscriptions/create-payment-session.use-case';
import { CompleteSubscriptionPaymentUseCase } from '../../../core/application/use-cases/subscriptions/complete-subscription-payment.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { UserPayload } from '../decorators/current-user.decorator';
import { CreatePaymentSessionDto } from '../dto/subscription/subscription-requests.dto';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly createSessionUseCase: CreatePaymentSessionUseCase,
    private readonly completePaymentUseCase: CompleteSubscriptionPaymentUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Post('session')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Crear una sesión de pago para Niubiz' })
  async createSession(
    @Body() dto: CreatePaymentSessionDto,
    @CurrentUser() user: UserPayload,
  ) {
    return await this.createSessionUseCase.execute({
      userId: user.sub,
      planType: dto.planType,
    });
  }

  @Post('callback')
  @ApiOperation({
    summary: 'Callback de Niubiz para procesar el resultado del pago',
  })
  async handleCallback(
    @Query('id') purchaseNumber: string,
    @Body('transactionToken') token: string,
    @Res() res: Response,
  ) {
    const result = await this.completePaymentUseCase.execute({
      tokenId: token,
      purchaseNumber: purchaseNumber,
    });

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const params = new URLSearchParams({
      success: String(result.success),
      purchaseNumber: purchaseNumber,
      transactionDate: result.transactionDate || '',
      amount: String(result.amount || 0),
      currency: result.currency || 'PEN',
      statusMessage: result.success
        ? 'Pago realizado con éxito'
        : result.actionDescription ||
          result.errorMessage ||
          'Transacción denegada',
      cardBrand: result.cardBrand || '',
      cardNumber: result.cardNumber || '',
      authorizationCode: result.authorizationCode || '',
    });

    const redirectUrl = `${frontendUrl}/payment-result?${params.toString()}`;

    return res.send(`
          <html>
            <head><title>Procesando Pago...</title></head>
            <body>
              <script>
                window.location.href = '${redirectUrl}';
              </script>
            </body>
          </html>
        `);
  }
}
