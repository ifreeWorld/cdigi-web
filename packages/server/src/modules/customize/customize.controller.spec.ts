import { Test, TestingModule } from '@nestjs/testing';
import { CustomizeController } from './customize.controller';

describe('CustomizeController', () => {
  let controller: CustomizeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomizeController],
    }).compile();

    controller = module.get<CustomizeController>(CustomizeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
