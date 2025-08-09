import { Module } from '@nestjs/common';
import { ObrasService } from './obras.service';
import { ObrasController } from './obras.controller';
import { LogsModule } from 'src/logs/logs.module';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Obra } from './entities/obra.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Obra
    ]),
    LogsModule,
    AuthModule
  ],
  controllers: [ObrasController],
  providers: [ObrasService],
})
export class ObrasModule {}
