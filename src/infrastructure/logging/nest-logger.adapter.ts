import { Injectable, Logger } from '@nestjs/common';
import type { ILogger } from '../../core/application/services/logger.interface';

@Injectable()
export class NestLoggerAdapter implements ILogger {
  private readonly logger = new Logger(NestLoggerAdapter.name);

  log(message: string): void {
    this.logger.log(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  error(message: string): void {
    this.logger.error(message);
  }
}
