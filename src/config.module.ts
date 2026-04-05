import { Module, Provider } from '@nestjs/common';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';

// Repositories
import { PrismaWhatsAppAccountRepository } from './infrastructure/persistence/prisma/repositories/prisma-whatsapp-account.repository';
import { PrismaAIConfigRepository } from './infrastructure/persistence/prisma/repositories/prisma-ai-config.repository';
import { PrismaProductRepository } from './infrastructure/persistence/prisma/repositories/prisma-product.repository';
import { PrismaStoreRepository } from './infrastructure/persistence/prisma/repositories/prisma-store.repository';

import { PrismaWhatsAppTemplateRepository } from './infrastructure/persistence/prisma/repositories/prisma-whatsapp-template.repository';
import { PrismaQuickResponseRepository } from './infrastructure/persistence/prisma/repositories/prisma-quick-response.repository';

// Knowledge Retrieval (Services)
import { PrismaKnowledgeRetrievalService } from './infrastructure/persistence/prisma/services/prisma-knowledge-retrieval.service';

// Use Cases - Products
import { CreateProductUseCase } from './core/application/use-cases/config/products/create-product.use-case';
import { ListProductsUseCase } from './core/application/use-cases/config/products/list-products.use-case';
import { UpdateProductUseCase } from './core/application/use-cases/config/products/update-product.use-case';
import { DeleteProductUseCase } from './core/application/use-cases/config/products/delete-product.use-case';
import { GetProductUseCase } from './core/application/use-cases/config/products/get-product.use-case';

// Use Cases - WhatsApp
import { CreateWhatsAppAccountUseCase } from './core/application/use-cases/config/whatsapp/create-whatsapp-account.use-case';
import { ListWhatsAppAccountsUseCase } from './core/application/use-cases/config/whatsapp/list-whatsapp-accounts.use-case';
import { UpdateWhatsAppAccountUseCase } from './core/application/use-cases/config/whatsapp/update-whatsapp-account.use-case';
import { DeleteWhatsAppAccountUseCase } from './core/application/use-cases/config/whatsapp/delete-whatsapp-account.use-case';
import { GetWhatsAppAccountUseCase } from './core/application/use-cases/config/whatsapp/get-whatsapp-account.use-case';

// Use Cases - Stores
import { CreateStoreUseCase } from './core/application/use-cases/config/stores/create-store.use-case';
import { ListStoresUseCase } from './core/application/use-cases/config/stores/list-stores.use-case';
import { UpdateStoreUseCase } from './core/application/use-cases/config/stores/update-store.use-case';
import { DeleteStoreUseCase } from './core/application/use-cases/config/stores/delete-store.use-case';
import { GetStoreUseCase } from './core/application/use-cases/config/stores/get-store.use-case';

// Use Cases - AI & KB
import { UpdateAIConfigUseCase } from './core/application/use-cases/config/ai/update-ai-config.use-case';
import {
  GetAIConfigUseCase,
  DeleteAIConfigUseCase,
} from './core/application/use-cases/config/ai/ai-config-ops.use-case';

// Use Cases - Automation
import {
  CreateTemplateUseCase,
  ListTemplatesUseCase,
} from './core/application/use-cases/config/automation/templates.use-case';
import {
  UpdateTemplateUseCase,
  DeleteTemplateUseCase,
} from './core/application/use-cases/config/automation/template-ops.use-case';
import {
  CreateQuickResponseUseCase,
  ListQuickResponsesUseCase,
} from './core/application/use-cases/config/automation/quick-responses.use-case';
import {
  UpdateQuickResponseUseCase,
  DeleteQuickResponseUseCase,
} from './core/application/use-cases/config/automation/quick-response-ops.use-case';

// Controllers
import { ProductController } from './interface/http/controllers/config/product.controller';
import { WhatsAppAccountController } from './interface/http/controllers/config/whatsapp-account.controller';
import { StoreController } from './interface/http/controllers/config/store.controller';
import { AIController } from './interface/http/controllers/config/ai.controller';
import { AutomationController } from './interface/http/controllers/config/automation.controller';
import { I_LOGGER } from './core/application/services/logger.interface';
import { NestLoggerAdapter } from './infrastructure/logging/nest-logger.adapter';
import { WhatsAppCloudApiService } from './infrastructure/external-apis/whatsapp/whatsapp-cloud-api.service';
import type { IProductRepository } from './core/domain/repositories/product.repository.interface';
import type { IWhatsAppAccountRepository } from './core/domain/repositories/whatsapp-account.repository.interface';
import type { IWhatsAppMessagingService } from './core/domain/services/whatsapp-messaging.interface';
import type { ILogger } from './core/application/services/logger.interface';
import type { IStoreRepository } from './core/domain/repositories/store.repository.interface';
import type { IAIConfigRepository } from './core/domain/repositories/ai-config.repository.interface';
import type { IWhatsAppTemplateRepository } from './core/domain/repositories/whatsapp-template.repository.interface';
import type { IQuickResponseRepository } from './core/domain/repositories/quick-response.repository.interface';
import type { IUserRepository } from './core/domain/repositories/user.repository.interface';

const repositories: Provider[] = [
  {
    provide: 'IWhatsAppAccountRepository',
    useClass: PrismaWhatsAppAccountRepository,
  },
  { provide: 'IAIConfigRepository', useClass: PrismaAIConfigRepository },
  { provide: 'IProductRepository', useClass: PrismaProductRepository },
  { provide: 'IStoreRepository', useClass: PrismaStoreRepository },

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
  {
    provide: 'IWhatsAppMessagingService',
    useClass: WhatsAppCloudApiService,
  },
];

const useCases: Provider[] = [
  { provide: I_LOGGER, useClass: NestLoggerAdapter },
  {
    provide: CreateProductUseCase,
    inject: ['IProductRepository'],
    useFactory: (productRepo: IProductRepository) =>
      new CreateProductUseCase(productRepo),
  },
  {
    provide: ListProductsUseCase,
    inject: ['IProductRepository'],
    useFactory: (productRepo: IProductRepository) =>
      new ListProductsUseCase(productRepo),
  },
  {
    provide: UpdateProductUseCase,
    inject: ['IProductRepository'],
    useFactory: (productRepo: IProductRepository) =>
      new UpdateProductUseCase(productRepo),
  },
  {
    provide: DeleteProductUseCase,
    inject: ['IProductRepository'],
    useFactory: (productRepo: IProductRepository) =>
      new DeleteProductUseCase(productRepo),
  },
  {
    provide: GetProductUseCase,
    inject: ['IProductRepository'],
    useFactory: (productRepo: IProductRepository) =>
      new GetProductUseCase(productRepo),
  },
  {
    provide: CreateWhatsAppAccountUseCase,
    inject: [
      'IWhatsAppAccountRepository',
      'IWhatsAppMessagingService',
      I_LOGGER,
    ],
    useFactory: (
      accountRepo: IWhatsAppAccountRepository,
      messagingService: IWhatsAppMessagingService,
      logger: ILogger,
    ) =>
      new CreateWhatsAppAccountUseCase(accountRepo, messagingService, logger),
  },
  {
    provide: ListWhatsAppAccountsUseCase,
    inject: ['IWhatsAppAccountRepository', 'IUserRepository'],
    useFactory: (accountRepo: IWhatsAppAccountRepository, userRepo: IUserRepository) =>
      new ListWhatsAppAccountsUseCase(accountRepo, userRepo),
  },
  {
    provide: UpdateWhatsAppAccountUseCase,
    inject: [
      'IWhatsAppAccountRepository',
      'IWhatsAppMessagingService',
      I_LOGGER,
    ],
    useFactory: (
      accountRepo: IWhatsAppAccountRepository,
      messagingService: IWhatsAppMessagingService,
      logger: ILogger,
    ) =>
      new UpdateWhatsAppAccountUseCase(accountRepo, messagingService, logger),
  },
  {
    provide: DeleteWhatsAppAccountUseCase,
    inject: ['IWhatsAppAccountRepository'],
    useFactory: (accountRepo: IWhatsAppAccountRepository) =>
      new DeleteWhatsAppAccountUseCase(accountRepo),
  },
  {
    provide: GetWhatsAppAccountUseCase,
    inject: ['IWhatsAppAccountRepository'],
    useFactory: (accountRepo: IWhatsAppAccountRepository) =>
      new GetWhatsAppAccountUseCase(accountRepo),
  },
  {
    provide: CreateStoreUseCase,
    inject: ['IStoreRepository'],
    useFactory: (storeRepo: IStoreRepository) =>
      new CreateStoreUseCase(storeRepo),
  },
  {
    provide: ListStoresUseCase,
    inject: ['IStoreRepository'],
    useFactory: (storeRepo: IStoreRepository) =>
      new ListStoresUseCase(storeRepo),
  },
  {
    provide: UpdateStoreUseCase,
    inject: ['IStoreRepository'],
    useFactory: (storeRepo: IStoreRepository) =>
      new UpdateStoreUseCase(storeRepo),
  },
  {
    provide: DeleteStoreUseCase,
    inject: ['IStoreRepository'],
    useFactory: (storeRepo: IStoreRepository) =>
      new DeleteStoreUseCase(storeRepo),
  },
  {
    provide: GetStoreUseCase,
    inject: ['IStoreRepository'],
    useFactory: (storeRepo: IStoreRepository) => new GetStoreUseCase(storeRepo),
  },
  {
    provide: UpdateAIConfigUseCase,
    inject: ['IAIConfigRepository'],
    useFactory: (aiConfigRepo: IAIConfigRepository) =>
      new UpdateAIConfigUseCase(aiConfigRepo),
  },
  {
    provide: GetAIConfigUseCase,
    inject: ['IAIConfigRepository'],
    useFactory: (aiConfigRepo: IAIConfigRepository) =>
      new GetAIConfigUseCase(aiConfigRepo),
  },
  {
    provide: DeleteAIConfigUseCase,
    inject: ['IAIConfigRepository'],
    useFactory: (aiConfigRepo: IAIConfigRepository) =>
      new DeleteAIConfigUseCase(aiConfigRepo),
  },
  {
    provide: CreateTemplateUseCase,
    inject: ['IWhatsAppTemplateRepository', 'IWhatsAppMessagingService'],
    useFactory: (
      templateRepo: IWhatsAppTemplateRepository,
      messagingService: IWhatsAppMessagingService,
    ) => new CreateTemplateUseCase(templateRepo, messagingService),
  },
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
      messagingService: IWhatsAppMessagingService,
    ) => new UpdateTemplateUseCase(templateRepo, messagingService),
  },
  {
    provide: DeleteTemplateUseCase,
    inject: ['IWhatsAppTemplateRepository'],
    useFactory: (templateRepo: IWhatsAppTemplateRepository) =>
      new DeleteTemplateUseCase(templateRepo),
  },
  {
    provide: CreateQuickResponseUseCase,
    inject: ['IQuickResponseRepository'],
    useFactory: (qrRepo: IQuickResponseRepository) =>
      new CreateQuickResponseUseCase(qrRepo),
  },
  {
    provide: ListQuickResponsesUseCase,
    inject: ['IQuickResponseRepository'],
    useFactory: (qrRepo: IQuickResponseRepository) =>
      new ListQuickResponsesUseCase(qrRepo),
  },
  {
    provide: UpdateQuickResponseUseCase,
    inject: ['IQuickResponseRepository'],
    useFactory: (qrRepo: IQuickResponseRepository) =>
      new UpdateQuickResponseUseCase(qrRepo),
  },
  {
    provide: DeleteQuickResponseUseCase,
    inject: ['IQuickResponseRepository'],
    useFactory: (qrRepo: IQuickResponseRepository) =>
      new DeleteQuickResponseUseCase(qrRepo),
  },
];

@Module({
  imports: [PrismaModule],
  controllers: [
    ProductController,
    WhatsAppAccountController,
    StoreController,
    AIController,
    AutomationController,
  ],
  providers: [...repositories, ...useCases],
  exports: [
    'IWhatsAppAccountRepository',
    'IAIConfigRepository',
    'IKnowledgeRetrievalService',
    'IWhatsAppTemplateRepository',
    'IQuickResponseRepository',
    'IStoreRepository',
  ],
})
export class AppConfigModule {}
