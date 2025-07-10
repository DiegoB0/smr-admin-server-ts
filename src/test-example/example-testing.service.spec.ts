import { Test, TestingModule } from '@nestjs/testing';
import { ExampleTestingService } from './example-testing.service';

describe('ExampleTestingService', () => {
  let service: ExampleTestingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExampleTestingService],
    }).compile();

    service = module.get<ExampleTestingService>(ExampleTestingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add two numbers', () => {
    expect(service.add(1, 2)).toBe(3);
  })

  it('should divide two numbers', () => {
    expect(service.divide(4, 2)).toBe(2);
  })
});
