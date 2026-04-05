export interface RealtimeStatusUpdate {
  waMessageId?: string;
  status?: string;
  chatId?: string;
  errorCode?: number;
  errorDetails?: string;
}

export interface IRealtimeNotifier {
  emitNewMessage(
    whatsAppAccountId: string,
    message: Record<string, unknown>,
  ): void;
  emitStatusUpdate(
    whatsAppAccountId: string,
    update: RealtimeStatusUpdate,
  ): void;
  emitChatUpdate(
    whatsAppAccountId: string,
    chat: Record<string, unknown>,
  ): void;
}

export const I_REALTIME_NOTIFIER = 'IRealtimeNotifier';
