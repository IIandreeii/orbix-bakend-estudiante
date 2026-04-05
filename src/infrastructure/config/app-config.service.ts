import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IAppConfig } from '../../core/application/services/app-config.interface';

@Injectable()
export class AppConfigService implements IAppConfig {
  constructor(private readonly configService: ConfigService) {}

  get<T = string>(key: string): T | undefined {
    return this.configService.get<T>(key);
  }
}
