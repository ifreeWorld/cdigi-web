import { Test, TestingModule } from '@nestjs/testing';
import { TransitController } from './transit.controller';

describe('TransitController', () => {
  let controller: TransitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransitController],
    }).compile();

    controller = module.get<TransitController>(TransitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
