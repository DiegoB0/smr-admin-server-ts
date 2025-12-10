import { Test, TestingModule } from '@nestjs/testing';
import { RequisicionesService } from './requisiciones.service';
import { DataSource } from 'typeorm';
import { RequisicionType } from './types/requisicion-type';
import { PrioridadType } from './types/prioridad-type';
import { ConceptoType } from './types/concepto-type';
import { MetodoPago } from './types/metodo-pago';
import { User } from 'src/auth/entities/usuario.entity';
import { LogsService } from 'src/logs/logs.service';

describe('RequisicionesService', () => {
  let service: RequisicionesService;
  let mockDataSource: any;
  let mockQueryRunner: any;
  let mockManager: any;

  beforeEach(async () => {
    mockManager = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: mockManager,
    };

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequisicionesService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: 'RequisicionRepository', useValue: { findOne: jest.fn() } },
        { provide: 'RequisicionInsumoItemRepository', useValue: { findOne: jest.fn() } },
        { provide: 'UserRepository', useValue: { findOne: jest.fn() } },
        { provide: 'RequisicionRefaccionItemRepository', useValue: { findOne: jest.fn() } },
        { provide: 'RequisicionFilterItemRepository', useValue: { findOne: jest.fn() } },
        { provide: 'EntradaRepository', useValue: { findOne: jest.fn() } },
        { provide: 'EntradaItemRepository', useValue: { findOne: jest.fn() } },
        { provide: LogsService, useValue: { log: jest.fn() } }, // Use class, not string
      ],
    }).compile();

    service = module.get<RequisicionesService>(RequisicionesService);
  });

  it('should create requisicion with almacenEncargados', async () => {
    const mockUser: User = {
      requisiciones: [],
      almacenEncargados: [],
      almacenAdminConta: [],
      entradas: [],
      requisicionesAprovadas: [],
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'test',
      email: 'test@example.com',
      password: 'hashedPassword',
      isActive: true,
      logs: [],
      apiKeys: [],
      usuarioRoles: []
    };
    const mockAlmacen = { id: 1, name: 'Almacen A' };
    const mockDto = {
      rcp: 1001,
      titulo: 'Test',
      almacenCargoId: 1,
      requisicionType: RequisicionType.REFACCIONES,  
      items: [],
      prioridad: PrioridadType.ALTA,                
      concepto: ConceptoType.VIATICOS,               
      observaciones: 'test',
      hrs: 100,
      currency: 'USD',
      metodo_pago: MetodoPago.SIN_PAGAR,             
    };

    mockManager.findOne.mockResolvedValueOnce({
      id: 1,
      almacenEncargados: [{ almacen: mockAlmacen }],
      almacenAdminConta: [{ almacen: null }],
    });

    const mockQueryBuilder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValueOnce({ identifiers: [{ id: 1 }] }),
    };

    mockManager.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockManager.findOne.mockResolvedValueOnce({
      id: 1,
      titulo: 'Test',
      almacenDestino: mockAlmacen,
    });

    mockManager.findOne.mockResolvedValueOnce({
      id: 1,
      refacciones: [],
      insumos: [],
      filtros: [],
    });

    jest.spyOn(service as any, 'addRefaccionItems').mockResolvedValueOnce(undefined);
    jest.spyOn(service as any, 'calculateAndSetApprovalLevel').mockResolvedValueOnce(undefined);
    jest.spyOn(service as any, 'recalculateRequisicionAmounts').mockReturnValueOnce(undefined);

    const result = await service.createRequisicion(mockDto, mockUser);

    expect(result).toBeDefined();
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
  });
});
