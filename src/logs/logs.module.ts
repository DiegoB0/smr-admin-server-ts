import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { Log } from './entities/log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([
    Log,
  ])],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
