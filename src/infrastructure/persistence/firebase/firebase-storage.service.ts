import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { IStorageService } from '../../../core/domain/services/storage.interface';

@Injectable()
export class FirebaseStorageService implements IStorageService, OnModuleInit {
  private readonly logger = new Logger(FirebaseStorageService.name);
  private storage: admin.storage.Storage;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');
    const storageBucket = this.configService.get<string>(
      'FIREBASE_STORAGE_BUCKET',
    );

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket,
      });
    }
    this.storage = admin.storage();
    this.logger.log('Firebase Storage initialized');
  }

  async uploadFile(
    buffer: Buffer,
    path: string,
    mimeType: string,
  ): Promise<string> {
    try {
      const bucket = this.storage.bucket();
      const file = bucket.file(path);

      await file.save(buffer, {
        metadata: { contentType: mimeType },
        public: true,
      });

      // Firebase storage URL format: https://storage.googleapis.com/BUCKET_NAME/FILE_PATH
      return `https://storage.googleapis.com/${bucket.name}/${path}`;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error uploading to Firebase: ${message}`);
      throw new Error(`Upload failed: ${message}`);
    }
  }

  async downloadWhatsAppMedia(
    url: string,
    accessToken: string,
  ): Promise<Buffer> {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error('Failed to download media from WhatsApp');
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
