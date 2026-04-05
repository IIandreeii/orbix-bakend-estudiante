export interface NiubizSecurityResponse {
  accessToken: string;
}

export interface NiubizSessionRequest {
  channel: string;
  amount: number;
  antifraud: {
    clientIp?: string;
    merchantDefineData: {
      MDD4: string;
      MDD32: string;
      MDD75: string;
      MDD77: number;
    };
  };
  dataMap: {
    cardholderCity: string;
    cardholderCountry: string;
    cardholderAddress: string;
    cardholderPostalCode: string;
    cardholderState: string;
    cardholderPhoneNumber: string;
  };
}

export interface NiubizSessionResponse {
  sessionKey: string;
  expirationTime: number;
}

export interface NiubizAuthorizationRequest {
  channel: string;
  captureType: 'manual' | 'automatic';
  countable: boolean;
  order: {
    tokenId: string;
    purchaseNumber: string;
    amount: string;
    currency: string;
  };
  dataMap: {
    urlAddress: string;
    partnerIdCode: string;
    serviceLocationCityName: string;
    serviceLocationCountrySubdivisionCode: string;
    serviceLocationCountryCode: string;
    serviceLocationPostalCode: string;
  };
}

export interface NiubizDataMap {
  STATUS: string;
  ACTION_DESCRIPTION: string;
  BRAND: string;
  CARD: string;
  TRANSACTION_DATE: string;
  [key: string]: string | number | boolean | undefined;
}

export interface NiubizAuthorizationResponse {
  header: {
    ecoreTransactionUUID: string;
    ecoreTransactionDate: number;
    millis: number;
  };
  fulfillment?: {
    channel: string;
    merchantId: string;
    terminalId: string;
    captureType: string;
    countable: boolean;
    signature: string;
  };
  order?: {
    tokenId: string;
    purchaseNumber: string;
    amount: number;
    currency: string;
    authorizationCode: string;
    transactionId: string;
    actionCode: string;
    transactionDate: string;
  };
  dataMap?: NiubizDataMap;
  errorCode?: number | string;
  errorMessage?: string;
  data?: {
    STATUS?: string;
    ACTION_DESCRIPTION?: string;
    BRAND?: string;
    CARD?: string;
    TRANSACTION_DATE?: string;
    TRANSACTION_ID?: string;
    AMOUNT?: string;
    CURRENCY?: string;
    YAPE_ID?: string;
    [key: string]: string | number | boolean | undefined;
  };
}
