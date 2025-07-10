import { Injectable } from '@nestjs/common';

@Injectable()
export class ExampleTestingService {
  add(a: number, b: number): number {

    return a + b;
  }

  divide(a: number, b: number): number {

    return a / b;
  }
}
