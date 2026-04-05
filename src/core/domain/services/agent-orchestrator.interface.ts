export interface ProcessAIParams {
  whatsAppAccountId: string;
  chatId: string;
  customerPhone: string;
}

export interface IAgentOrchestrator {
  processMessage(params: ProcessAIParams): Promise<void>;
}
