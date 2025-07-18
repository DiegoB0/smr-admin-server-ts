import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Log } from './entities/log.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/usuario.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {
    //
  }

  async createLog(
    user: User,
    message: string,
    actionType: string,
    requestBody?: string,
  ): Promise<Log> {
    const log = this.logRepository.create({
      user: user ?? undefined,
      message,
      actionType,
      requestBody,
    });
    return this.logRepository.save(log);
  }
}
