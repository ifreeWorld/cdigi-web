import { Test, TestingModule } from '@nestjs/testing';
import { TransitService } from './transit.service';

describe('TransitService', () => {
  let service: TransitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransitService],
    }).compile();

    service = module.get<TransitService>(TransitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
