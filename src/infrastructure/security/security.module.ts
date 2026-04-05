import { Module, Global } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { JwtTokenService } from './jwt-token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EncryptionService } from './encryption.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('JWT_SECRET') || 'default_secret_dont_use_in_prod',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [
    {
      provide: 'IHashService',
      useClass: BcryptService,
    },
    {
      provide: 'ITokenService',
      useClass: JwtTokenService,
    },
    {
      provide: 'IEncryptionService',
      useClass: EncryptionService,
    },
  ],
  exports: ['IHashService', 'ITokenService', 'IEncryptionService', JwtModule],
})
export class SecurityModule {}
