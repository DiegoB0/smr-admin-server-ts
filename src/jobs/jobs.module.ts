import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ExcelProcessor } from './processors/excel.processor';
import { AlmacenesModule } from 'src/almacenes/almacenes.module';

@Module({
  imports: [
    forwardRef(() => AlmacenesModule),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        enableOfflineQueue: true,
        retryStrategy: (times) => Math.min(times * 50, 2000),
      }
    }),
    BullModule.registerQueue({
      name: 'excel-queue',
    }),
  ],
  providers: [ExcelProcessor],
  exports: [BullModule],
})
export class JobsModule { }
