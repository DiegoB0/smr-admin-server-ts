import { Test, TestingModule } from '@nestjs/testing';
import { RequisicionesController } from './requisiciones.controller';
import { RequisicionesService } from './requisiciones.service';

describe('RequisicionesController', () => {
  let controller: RequisicionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequisicionesController],
      providers: [RequisicionesService],
    }).compile();

    controller = module.get<RequisicionesController>(RequisicionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
