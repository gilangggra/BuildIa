import { Test, TestingModule } from '@nestjs/testing';
import { ArtefactsController } from './artefacts.controller';

describe('ArtefactsController', () => {
  let controller: ArtefactsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtefactsController],
    }).compile();

    controller = module.get<ArtefactsController>(ArtefactsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
