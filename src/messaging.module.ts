import { Module, Provider } from '@nestjs/common';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';

// Repositories
import { PrismaChatRepository } from './infrastructure/persistence/prisma/repositories/prisma-chat.repository';
import { PrismaMessageRepository } from './infrastructure/persistence/prisma/repositories/prisma-message.repository';
import { PrismaWhatsAppTemplateRepository } from './infrastructure/persistence/prisma/repositories/prisma-whatsapp-template.repository';
import { PrismaQuickResponseRepository } from './infrastructure/persistence/prisma/repositories/prisma-quick-response.repository';
import { PrismaWhatsAppAccountRepository } from './infrastructure/persistence/prisma/repositories/prisma-whatsapp-account.repository';
import { PrismaAIConfigRepository } from './infrastructure/persistence/prisma/repositories/prisma-ai-config.repository';
import { PrismaStoreRepository } from './infrastructure/persistence/prisma/repositories/prisma-store.repository';
import { PrismaProductRepository } from './infrastructure/persistence/prisma/repositories/prisma-product.repository';

// Services
import { WhatsAppCloudApiService } from './infrastructure/external-apis/whatsapp/whatsapp-cloud-api.service';
import { FirebaseStorageService } from './infrastructure/persistence/firebase/firebase-storage.service';
import { GeminiService } from './infrastructure/external-apis/ai/gemini.service';
import { OpenAIService } from './infrastructure/external-apis/ai/openai.service';
import { AIFactoryService } from './infrastructure/external-apis/ai/ai-factory.service';
import { PrismaKnowledgeRetrievalService } from './infrastructure/persistence/prisma/services/prisma-knowledge-retrieval.service';

// Use Cases
import { SendMessageUseCase } from './core/application/use-cases/messaging/send-message.use-case';
import { ReceiveMessageUseCase } from './core/application/use-cases/messaging/receive-message.use-case';
import { HandleMessageStatusUseCase } from './core/application/use-cases/messaging/handle-message-status.use-case';
import { ProcessAIResponseUseCase } from './core/application/use-cases/ai-agent/process-ai-response.use-case';
import { MarkChatAsReadUseCase } from './core/application/use-cases/messaging/mark-chat-as-read.use-case';
import { ListChatsUseCase } from './core/application/use-cases/messaging/list-chats.use-case';
import { ListMessagesUseCase } from './core/application/use-cases/messaging/list-messages.use-case';
import { SearchMessagesUseCase } from './core/application/use-cases/messaging/search-messages.use-case';
import { GetMessageContextUseCase } from './core/application/use-cases/messaging/get-message-context.use-case';
import { CreateChatUseCase } from './core/application/use-cases/messaging/create-chat.use-case';
import { UpdateChatUseCase } from './core/application/use-cases/messaging/update-chat.use-case';

import { WhatsAppMessagingController } from './interface/http/controllers/messaging/whatsapp-messaging.controller';
import { WhatsAppWebhookController } from './interface/http/controllers/messaging/whatsapp-webhook.controller';
import { MessagingGateway } from './interface/http/gateways/messaging.gateway';
import { NestLoggerAdapter } from './infrastructure/logging/nest-logger.adapter';
import { I_LOGGER } from './core/application/services/logger.interface';
import { I_REALTIME_NOTIFIER } from './core/application/services/realtime-notifier.interface';
import { I_AI_RESPONSE_GENERATOR } from './core/application/services/ai-factory.interface';
import {
  I_AI_HISTORY_MAPPER,
  I_AI_OUTBOUND_DRAFT_FACTORY,
  I_AI_RESPONSE_DELIVERY_SERVICE,
  I_AI_SYSTEM_PROMPT_BUILDER,
} from './core/application/services/ai-orchestration.interface';
import {
  I_INBOUND_MEDIA_PROCESSOR,
  I_INBOUND_MESSAGE_POST_PROCESSOR,
  I_MESSAGE_CONTENT_RESOLVER,
  I_OUTBOUND_MESSAGE_DISPATCHER,
} from './core/application/services/messaging-flow.interface';
import type { IChatRepository } from './core/domain/repositories/chat.repository.interface';
import type { IMessageRepository } from './core/domain/repositories/message.repository.interface';
import type { IWhatsAppMessagingService } from './core/domain/services/whatsapp-messaging.interface';
import type { IQuickResponseRepository } from './core/domain/repositories/quick-response.repository.interface';
import type { IWhatsAppTemplateRepository } from './core/domain/repositories/whatsapp-template.repository.interface';
import type { IRealtimeNotifier } from './core/application/services/realtime-notifier.interface';
import type { ILogger } from './core/application/services/logger.interface';
import type { IAIConfigRepository } from './core/domain/repositories/ai-config.repository.interface';
import type { IKnowledgeRetrievalService } from './core/domain/services/knowledge-retrieval.interface';
import type { IAIResponseGenerator } from './core/application/services/ai-factory.interface';
import type {
  IAIHistoryMapper,
  IAIResponseDeliveryService,
  IAISystemPromptBuilder,
} from './core/application/services/ai-orchestration.interface';
import type {
  IInboundMediaProcessor,
  IInboundMessagePostProcessor,
  IMessageContentResolver,
  IOutboundMessageDispatcher,
} from './core/application/services/messaging-flow.interface';
import { AISystemPromptBuilder } from './infrastructure/services/ai-system-prompt.builder';
import { AIHistoryMapper } from './infrastructure/services/ai-history.mapper';
import { AIOutboundDraftFactory } from './infrastructure/services/ai-outbound-draft.factory';
import { MessageContentResolverService } from './infrastructure/services/message-content-resolver.service';
import { OutboundMessageDispatcherService } from './infrastructure/services/outbound-message-dispatcher.service';
import { InboundMediaProcessorService } from './infrastructure/services/inbound-media-processor.service';
import { InboundMessagePostProcessorService } from './infrastructure/services/inbound-message-post-processor.service';
import { AIResponseDeliveryService } from './infrastructure/services/ai-response-delivery.service';
import { ListTemplatesUseCase } from './core/application/use-cases/messaging/list-templates.use-case';
import { UpdateTemplateUseCase } from './core/application/use-cases/messaging/update-template.use-case';

const repositories: Provider[] = [
  { provide: 'IChatRepository', useClass: PrismaChatRepository },
  { provide: 'IMessageRepository', useClass: PrismaMessageRepository },
  {
    provide: 'IWhatsAppAccountRepository',
    useClass: PrismaWhatsAppAccountRepository,
  },
  { provide: 'IAIConfigRepository', useClass: PrismaAIConfigRepository },
  { provide: 'IStoreRepository', useClass: PrismaStoreRepository },
  { provide: 'IProductRepository', useClass: PrismaProductRepository },
  {
    provide: 'IWhatsAppTemplateRepository',
    useClass: PrismaWhatsAppTemplateRepository,
  },
  {
    provide: 'IQuickResponseRepository',
    useClass: PrismaQuickResponseRepository,
  },
  {
    provide: 'IKnowledgeRetrievalService',
    useClass: PrismaKnowledgeRetrievalService,
  },
];

const services: Provider[] = [
  { provide: 'IWhatsAppMessagingService', useClass: WhatsAppCloudApiService },
  { provide: 'IStorageService', useClass: FirebaseStorageService },
  GeminiService,
  OpenAIService,
  AIFactoryService,
  { provide: I_AI_RESPONSE_GENERATOR, useExisting: AIFactoryService },
  { provide: I_AI_SYSTEM_PROMPT_BUILDER, useClass: AISystemPromptBuilder },
  { provide: I_AI_HISTORY_MAPPER, useClass: AIHistoryMapper },
  {
    provide: I_AI_OUTBOUND_DRAFT_FACTORY,
    useClass: AIOutboundDraftFactory,
  },
  {
    provide: I_MESSAGE_CONTENT_RESOLVER,
    useClass: MessageContentResolverService,
  },
  {
    provide: I_OUTBOUND_MESSAGE_DISPATCHER,
    useClass: OutboundMessageDispatcherService,
  },
  {
    provide: I_INBOUND_MEDIA_PROCESSOR,
    useClass: InboundMediaProcessorService,
  },
  {
    provide: I_INBOUND_MESSAGE_POST_PROCESSOR,
    useClass: InboundMessagePostProcessorService,
  },
  {
    provide: I_AI_RESPONSE_DELIVERY_SERVICE,
    useClass: AIResponseDeliveryService,
  },
  { provide: I_LOGGER, useClass: NestLoggerAdapter },
  { provide: I_REALTIME_NOTIFIER, useExisting: MessagingGateway },
];

const useCases: Provider[] = [
  {
    provide: SendMessageUseCase,
    inject: [
      'IChatRepository',
      'IQuickResponseRepository',
      'IWhatsAppTemplateRepository',
      I_MESSAGE_CONTENT_RESOLVER,
      I_OUTBOUND_MESSAGE_DISPATCHER,
    ],
    useFactory: (
      chatRepo: IChatRepository,
      quickResponseRepo: IQuickResponseRepository,
      templateRepo: IWhatsAppTemplateRepository,
      contentResolver: IMessageContentResolver,
      outboundDispatcher: IOutboundMessageDispatcher,
    ) =>
      new SendMessageUseCase(
        chatRepo,
        quickResponseRepo,
        templateRepo,
        contentResolver,
        outboundDispatcher,
      ),
  },
  {
    provide: ReceiveMessageUseCase,
    inject: [
      'IChatRepository',
      'IMessageRepository',
      I_INBOUND_MEDIA_PROCESSOR,
      I_INBOUND_MESSAGE_POST_PROCESSOR,
    ],
    useFactory: (
      chatRepo: IChatRepository,
      messageRepo: IMessageRepository,
      mediaProcessor: IInboundMediaProcessor,
      postProcessor: IInboundMessagePostProcessor,
    ) =>
      new ReceiveMessageUseCase(
        chatRepo,
        messageRepo,
        mediaProcessor,
        postProcessor,
      ),
  },
  {
    provide: HandleMessageStatusUseCase,
    inject: [
      'IMessageRepository',
      'IChatRepository',
      I_REALTIME_NOTIFIER,
      I_LOGGER,
    ],
    useFactory: (
      messageRepo: IMessageRepository,
      chatRepo: IChatRepository,
      notifier: IRealtimeNotifier,
      logger: ILogger,
    ) =>
      new HandleMessageStatusUseCase(messageRepo, chatRepo, notifier, logger),
  },
  {
    provide: MarkChatAsReadUseCase,
    inject: ['IChatRepository', I_REALTIME_NOTIFIER],
    useFactory: (chatRepo: IChatRepository, notifier: IRealtimeNotifier) =>
      new MarkChatAsReadUseCase(chatRepo, notifier),
  },
  {
    provide: ListChatsUseCase,
    inject: ['IChatRepository'],
    useFactory: (chatRepo: IChatRepository) => new ListChatsUseCase(chatRepo),
  },
  {
    provide: ListMessagesUseCase,
    inject: ['IMessageRepository'],
    useFactory: (messageRepo: IMessageRepository) =>
      new ListMessagesUseCase(messageRepo),
  },
  {
    provide: SearchMessagesUseCase,
    inject: ['IMessageRepository'],
    useFactory: (messageRepo: IMessageRepository) =>
      new SearchMessagesUseCase(messageRepo),
  },
  {
    provide: GetMessageContextUseCase,
    inject: ['IMessageRepository'],
    useFactory: (messageRepo: IMessageRepository) =>
      new GetMessageContextUseCase(messageRepo),
  },
  {
    provide: CreateChatUseCase,
    inject: ['IChatRepository'],
    useFactory: (chatRepo: IChatRepository) => new CreateChatUseCase(chatRepo),
  },
  {
    provide: UpdateChatUseCase,
    inject: ['IChatRepository'],
    useFactory: (chatRepo: IChatRepository) => new UpdateChatUseCase(chatRepo),
  },
  {
    provide: ProcessAIResponseUseCase,
    inject: [
      'IAIConfigRepository',
      'IMessageRepository',
      'IKnowledgeRetrievalService',
      I_AI_RESPONSE_GENERATOR,
      I_AI_RESPONSE_DELIVERY_SERVICE,
      I_REALTIME_NOTIFIER,
      I_LOGGER,
      I_AI_SYSTEM_PROMPT_BUILDER,
      I_AI_HISTORY_MAPPER,
    ],
    useFactory: (
      aiConfigRepo: IAIConfigRepository,
      messageRepo: IMessageRepository,
      knowledgeService: IKnowledgeRetrievalService,
      aiFactory: IAIResponseGenerator,
      responseDelivery: IAIResponseDeliveryService,
      notifier: IRealtimeNotifier,
      logger: ILogger,
      promptBuilder: IAISystemPromptBuilder,
      historyMapper: IAIHistoryMapper,
    ) =>
      new ProcessAIResponseUseCase(
        aiConfigRepo,
        messageRepo,
        knowledgeService,
        aiFactory,
        responseDelivery,
        notifier,
        logger,
        promptBuilder,
        historyMapper,
      ),
  },
  { provide: 'IAgentOrchestrator', useExisting: ProcessAIResponseUseCase },
{
    provide: ListTemplatesUseCase,
    inject: ['IWhatsAppTemplateRepository'],
    useFactory: (templateRepo: IWhatsAppTemplateRepository) => 
      new ListTemplatesUseCase(templateRepo),
  },
  {
    provide: UpdateTemplateUseCase,
    inject: ['IWhatsAppTemplateRepository', 'IWhatsAppMessagingService'],
    useFactory: (
      templateRepo: IWhatsAppTemplateRepository,
      waService: IWhatsAppMessagingService,
    ) => new UpdateTemplateUseCase(templateRepo, waService),
  },

];

@Module({
  imports: [PrismaModule],
  controllers: [WhatsAppMessagingController, WhatsAppWebhookController],
  providers: [...repositories, ...services, ...useCases, MessagingGateway],
  exports: [
    'IChatRepository',
    'IMessageRepository',
    'IWhatsAppMessagingService',
    MessagingGateway,
    I_REALTIME_NOTIFIER,
  ],
})
export class MessagingModule {}
