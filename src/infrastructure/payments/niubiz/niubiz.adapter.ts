import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type {
  IPaymentGateway,
  PaymentSessionResponse,
  PaymentAuthorizationResponse,
} from '../../../core/application/services/payment-gateway.interface';
import type { User } from '../../../core/domain/entities/user.entity';
import type {
  NiubizSessionRequest,
  NiubizSessionResponse,
  NiubizAuthorizationRequest,
  NiubizAuthorizationResponse,
} from './interfaces/niubiz.interface';

type HttpErrorResponse = {
  response?: {
    data?: unknown;
  };
  message?: string;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown error';
};

const getResponseDataMessage = (error: unknown): string | undefined => {
  const err = error as HttpErrorResponse;
  const data = err.response?.data;

  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return undefined;
};

@Injectable()
export class NiubizAdapter implements IPaymentGateway {
  private readonly logger = new Logger(NiubizAdapter.name);
  private readonly merchantId: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const mId = this.configService.get<string>('NIUBIZ_MERCHANT_ID');
    if (!mId) throw new Error('NIUBIZ_MERCHANT_ID is not defined');
    this.merchantId = mId;
  }

  private async getSecurityToken(): Promise<string> {
    try {
      const username = this.configService.get<string>('NIUBIZ_USERNAME');
      const password = this.configService.get<string>('NIUBIZ_PASSWORD');
      const url = this.configService.get<string>('NIUBIZ_SECURITY_URL');

      if (!username || !password || !url) {
        throw new Error(
          'Niubiz configuration is missing (Username/Password/URL)',
        );
      }

      const authHeader = Buffer.from(`${username}:${password}`).toString(
        'base64',
      );

      const { data } = await firstValueFrom(
        this.httpService.get<string>(url, {
          headers: { Authorization: `Basic ${authHeader}` },
        }),
      );

      return data;
    } catch (error: unknown) {
      const responseMessage = getResponseDataMessage(error);
      this.logger.error(
        `Niubiz Security Token Error: ${responseMessage || getErrorMessage(error)}`,
      );
      throw new UnauthorizedException('Error al autenticarse con Niubiz');
    }
  }

  async createSession(
    amount: number,
    user: User,
    purchaseNumber: string,
  ): Promise<PaymentSessionResponse> {
    try {
      const token = await this.getSecurityToken();
      const baseUrl = this.configService.get<string>('NIUBIZ_SESSION_URL');
      const url = `${baseUrl}${this.merchantId}`;

      const diffTime = Math.abs(Date.now() - user.createdAt.getTime());
      const daysSinceRegistration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const body: NiubizSessionRequest = {
        channel: 'web',
        amount: amount,
        antifraud: {
          merchantDefineData: {
            MDD4: user.email,
            MDD32: user.id,
            MDD75: 'Registrado',
            MDD77: daysSinceRegistration,
          },
        },
        dataMap: {
          cardholderCity: user.city || 'Lima',
          cardholderCountry: user.countryCode || 'PE',
          cardholderAddress: user.address || 'Calle Central 123',
          cardholderPostalCode: user.zipCode || '15046',
          cardholderState: user.state || 'LIM',
          cardholderPhoneNumber: user.phone || '987654321',
        },
      };

      const { data } = await firstValueFrom(
        this.httpService.post<NiubizSessionResponse>(url, body, {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }),
      );

      return {
        sessionKey: data.sessionKey,
        purchaseNumber: purchaseNumber,
        merchantId: this.merchantId,
        amount: amount,
      };
    } catch (error: unknown) {
      const responseMessage = getResponseDataMessage(error);
      this.logger.error(
        `Niubiz Session Error: ${responseMessage || getErrorMessage(error)}`,
      );
      throw new InternalServerErrorException(
        'Error al crear la sesión de pago',
      );
    }
  }

  private formatNiubizDate(raw: string): string {
    if (raw && /^\d{12}$/.test(raw)) {
      const year = `20${raw.slice(0, 2)}`;
      const month = raw.slice(2, 4);
      const day = raw.slice(4, 6);
      const hour = raw.slice(6, 8);
      const min = raw.slice(8, 10);
      const sec = raw.slice(10, 12);
      return `${day}/${month}/${year} ${hour}:${min}:${sec}`;
    }
    return raw;
  }

  async authorizePayment(
    tokenId: string,
    purchaseNumber: string,
    amount: number,
    currency: string,
    user: User,
  ): Promise<PaymentAuthorizationResponse> {
    try {
      const accessToken = await this.getSecurityToken();
      const baseUrl = this.configService.get<string>('NIUBIZ_AUTH_URL');
      const url = `${baseUrl}${this.merchantId}`;

      const body: NiubizAuthorizationRequest = {
        channel: 'web',
        captureType: 'manual',
        countable: true,
        order: {
          tokenId,
          purchaseNumber,
          amount: amount.toFixed(2),
          currency: currency,
        },
        dataMap: {
          urlAddress: this.configService.get<string>('FRONTEND_URL') || '',
          partnerIdCode: '',
          serviceLocationCityName: user.city || 'Lima',
          serviceLocationCountrySubdivisionCode: 'LIM',
          serviceLocationCountryCode: 'PER',
          serviceLocationPostalCode: user.zipCode || '15046',
        },
      };

      const { data } = await firstValueFrom(
        this.httpService.post<NiubizAuthorizationResponse>(url, body, {
          headers: {
            Authorization: accessToken,
            'Content-Type': 'application/json',
          },
        }),
      );

      const isAuthorized =
        data.dataMap?.STATUS === 'Authorized' ||
        data.data?.STATUS === 'Authorized';
      const isYape = !!(data.dataMap?.YAPE_ID || data.data?.YAPE_ID);

      const rawDate =
        data.dataMap?.TRANSACTION_DATE ||
        data.data?.TRANSACTION_DATE ||
        data.order?.transactionDate ||
        '';

      return {
        success: isAuthorized,
        transactionId:
          data.order?.transactionId || (data.data?.TRANSACTION_ID as string),
        purchaseNumber: data.order?.purchaseNumber,
        amount:
          data.order?.amount ||
          (data.data?.AMOUNT ? Number(data.data.AMOUNT) : amount),
        currency:
          data.order?.currency || (data.data?.CURRENCY as string) || currency,
        authorizationCode: data.order?.authorizationCode,
        actionDescription: (data.dataMap?.ACTION_DESCRIPTION ||
          data.data?.ACTION_DESCRIPTION ||
          data.errorMessage) as string,
        cardBrand: isYape
          ? 'Yape'
          : ((data.dataMap?.BRAND || data.data?.BRAND) as string),
        cardNumber: isYape
          ? ''
          : ((data.dataMap?.CARD || data.data?.CARD) as string),
        transactionDate: this.formatNiubizDate(rawDate),
        isYape,
        errorMessage: data.errorMessage,
      };
    } catch (error: unknown) {
      const err = error as HttpErrorResponse;
      const errorData = err.response?.data as
        | NiubizAuthorizationResponse
        | undefined;
      return {
        success: false,
        errorMessage: errorData?.errorMessage || getErrorMessage(error),
        actionDescription:
          (errorData?.dataMap?.['ACTION_DESCRIPTION'] as string) ||
          errorData?.data?.ACTION_DESCRIPTION,
      };
    }
  }
}
