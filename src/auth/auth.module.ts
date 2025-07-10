import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ColumnTypeUndefinedError } from 'typeorm';
import { ApiKey } from './entities/api_key.entity';
import { User } from './entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([
    ApiKey,
    User,
  ])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
