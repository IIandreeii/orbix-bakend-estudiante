export interface KnowledgeContext {
  storeInfo: string;
  productsInfo: string;
  quickResponsesInfo: string;
  templatesInfo: string;
}

export interface IKnowledgeRetrievalService {
  getKnowledgeContext(whatsAppAccountId: string): Promise<KnowledgeContext>;
}
