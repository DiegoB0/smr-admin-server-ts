import { Controller, Get, Param } from '@nestjs/common';
import { ExampleTestingService } from './example-testing.service';

@Controller('example-testing')
export class ExampleTestingController {
  constructor(private readonly exampleService: ExampleTestingService) {}
 @Get('add/:a/:b')
  add(
    @Param('a') a: string,
    @Param('b') b: string,
  ): number {
    // parseInt for simplicity; in real code use ParseIntPipe
    return this.exampleService.add(+a, +b);
  }

  @Get('divide/:a/:b')
  divide(
    @Param('a') a: string,
    @Param('b') b: string,
  ): number {
    return this.exampleService.divide(+a, +b);
  }

}
