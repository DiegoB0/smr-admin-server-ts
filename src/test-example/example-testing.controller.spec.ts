import { Test, TestingModule } from '@nestjs/testing';
import { ExampleTestingController } from './example-testing.controller';
import { ExampleTestingService } from './example-testing.service';
import { warn } from 'console';

describe('ExampleTestingController', () => {
  let controller: ExampleTestingController;

  // Define the service mock first
  const serviceMock = {
    add: jest.fn(),
    divide: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExampleTestingController],
      providers: [
        // ExampleTestingService
        { provide: ExampleTestingService, useValue: serviceMock }
      ],
    }).compile();

    controller = module.get<ExampleTestingController>(ExampleTestingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('add() should call service.add and return its value', () => {
    // Arrange
    serviceMock.add.mockReturnValue(4);

    // Act
    const result = controller.add('1', '3');

    // Assert
    expect(result).toBe(4);

    // Check that the spy was called with numeric args
    expect(serviceMock.add).toHaveBeenCalledWith(1, 3);
  });

  // Testing the divide shi 
});
