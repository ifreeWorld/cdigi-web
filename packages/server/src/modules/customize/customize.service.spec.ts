import { Test, TestingModule } from '@nestjs/testing';
import { CustomizeService } from './customize.service';

describe('CustomizeService', () => {
  let service: CustomizeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomizeService],
    }).compile();

    service = module.get<CustomizeService>(CustomizeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
