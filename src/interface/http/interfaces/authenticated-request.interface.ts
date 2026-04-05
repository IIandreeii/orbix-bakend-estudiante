import { Request } from 'express';
import type { Role } from '../../../core/domain/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
    role: Role;
  };
}
