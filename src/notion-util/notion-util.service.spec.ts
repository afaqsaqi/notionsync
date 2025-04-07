import { Test, TestingModule } from '@nestjs/testing';
import { NotionUtilService } from './notion-util.service';

describe('NotionUtilService', () => {
  let service: NotionUtilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotionUtilService],
    }).compile();

    service = module.get<NotionUtilService>(NotionUtilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
