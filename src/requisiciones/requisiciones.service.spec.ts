import { Test, TestingModule } from '@nestjs/testing';
import { RequisicionesService } from './requisiciones.service';

describe('RequisicionesService', () => {
  let service: RequisicionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequisicionesService],
    }).compile();

    service = module.get<RequisicionesService>(RequisicionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
