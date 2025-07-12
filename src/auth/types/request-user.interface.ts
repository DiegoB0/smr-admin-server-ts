import { Request } from 'express';
import { User } from '../entities/usuario.entity';

export interface RequestWithUser extends Request {
  user: User;
}
