import { Test, TestingModule } from '@nestjs/testing';
import { ArtefactsService } from './artefacts.service';

describe('ArtefactsService', () => {
  let service: ArtefactsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArtefactsService],
    }).compile();

    service = module.get<ArtefactsService>(ArtefactsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
