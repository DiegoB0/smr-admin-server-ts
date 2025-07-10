import { Module } from '@nestjs/common';
import { ExampleTestingService } from './example-testing.service';
import { ExampleTestingController } from './example-testing.controller';

@Module({
  controllers: [ExampleTestingController],
  providers: [ExampleTestingService],
})
export class ExampleTestingModule {}
