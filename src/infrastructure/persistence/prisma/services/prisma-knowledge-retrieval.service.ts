import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  IKnowledgeRetrievalService,
  KnowledgeContext,
} from '../../../../core/domain/services/knowledge-retrieval.interface';
import type { IStoreRepository } from '../../../../core/domain/repositories/store.repository.interface';
import type { IProductRepository } from '../../../../core/domain/repositories/product.repository.interface';
import type { IQuickResponseRepository } from '../../../../core/domain/repositories/quick-response.repository.interface';
import type { IWhatsAppTemplateRepository } from '../../../../core/domain/repositories/whatsapp-template.repository.interface';

@Injectable()
export class PrismaKnowledgeRetrievalService implements IKnowledgeRetrievalService {
  private readonly logger = new Logger(PrismaKnowledgeRetrievalService.name);

  constructor(
    @Inject('IStoreRepository')
    private readonly storeRepository: IStoreRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('IQuickResponseRepository')
    private readonly quickResponseRepository: IQuickResponseRepository,
    @Inject('IWhatsAppTemplateRepository')
    private readonly templateRepository: IWhatsAppTemplateRepository,
  ) {}

  async getKnowledgeContext(
    whatsAppAccountId: string,
  ): Promise<KnowledgeContext> {
    try {
      const storesPage = await this.storeRepository.findAll({
        whatsAppAccountId,
        page: 1,
        limit: 10,
      });
      const mainStore = storesPage.data.length > 0 ? storesPage.data[0] : null;

      let storeInfo = 'No hay información de tienda registrada.';
      let productsInfo = 'No hay productos disponibles actualmente.';

      if (mainStore) {
        storeInfo = `Nombre de la Tienda: ${mainStore.name}\nEstado: ${mainStore.isActive ? 'Activa' : 'Inactiva'}`;

        const productsPage = await this.productRepository.findAll({
          storeId: mainStore.id,
          isActive: true,
          page: 1,
          limit: 50,
        });
        if (productsPage.data.length > 0) {
          productsInfo = 'LISTA DE PRODUCTOS DISPONIBLES:\n';
          productsInfo += productsPage.data
            .map(
              (p) =>
                `- ${p.name} | SKU: ${p.sku || 'N/A'} | Precio: ${p.price || 0} ${p.currency} | Stock: ${p.stock || 0}\n  Desc: ${p.description || 'Sin descripción'}\n  ImgUrl: ${p.imageUrl || 'N/A'}\n  VideoUrl: ${p.videoUrl || 'N/A'}`,
            )
            .join('\n---\n');
        }
      }

      const qrPage = await this.quickResponseRepository.findAll({
        whatsAppAccountId,
        isActive: true,
        page: 1,
        limit: 100,
      });
      let quickResponsesInfo = 'No hay respuestas rápidas (FAQs) predefinidas.';
      if (qrPage.data.length > 0) {
        quickResponsesInfo =
          'PREGUNTAS FRECUENTES (USAR COMO GUÍA PARA RESPUESTAS SIMILARES):\n';
        quickResponsesInfo += qrPage.data
          .map(
            (qr) => `- Tema: ${qr.keyword}\n  Info útil: ${qr.responseMessage}`,
          )
          .join('\n');
      }

      const templatesPage = await this.templateRepository.findAll({
        whatsAppAccountId,
        page: 1,
        limit: 50,
      });
      let templatesInfo = 'No hay plantillas oficiales disponibles.';
      if (templatesPage.data.length > 0) {
        templatesInfo =
          'PLANTILLAS OFICIALES DISPONIBLES (Puedes decidir enviar una si la situación lo amerita):\n';
        templatesInfo += templatesPage.data
          .map(
            (t) =>
              `- Nombre de Plantilla: '${t.name}' (Lenguaje: ${t.language})`,
          )
          .join('\n---\n');
      }

      return {
        storeInfo,
        productsInfo,
        quickResponsesInfo,
        templatesInfo,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error retrieving knowledge context: ${message}`);
      return {
        storeInfo: 'No store info available due to system error.',
        productsInfo: 'No product info available due to system error.',
        quickResponsesInfo: 'No FAQ available.',
        templatesInfo: 'No official templates available.',
      };
    }
  }
}
