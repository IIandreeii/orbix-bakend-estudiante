import type { User } from '../../domain/entities/user.entity';

export interface PaymentSessionResponse {
  sessionKey: string;
  purchaseNumber: string;
  merchantId: string;
  amount: number;
}

export interface PaymentAuthorizationResponse {
  success: boolean;
  transactionId?: string;
  purchaseNumber?: string;
  amount?: number;
  currency?: string;
  authorizationCode?: string;
  actionDescription?: string;
  errorMessage?: string;
  cardBrand?: string;
  cardNumber?: string;
  transactionDate?: string;
  isYape?: boolean;
}

export interface IPaymentGateway {
  /**
   * Crea una sesión de pago para el frontend
   */
  createSession(
    amount: number,
    user: User,
    purchaseNumber: string,
  ): Promise<PaymentSessionResponse>;

  /**
   * Autoriza la transacción con el token recibido de la pasarela
   */
  authorizePayment(
    tokenId: string,
    purchaseNumber: string,
    amount: number,
    currency: string,
    user: User,
  ): Promise<PaymentAuthorizationResponse>;
}
