import { IHashService } from '../../core/application/services/security.service.interface';
import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptService implements IHashService {
  private readonly saltRounds = 10;

  async hash(payload: string): Promise<string> {
    return bcrypt.hash(payload, this.saltRounds);
  }

  async compare(payload: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(payload, hashed);
  }
}
