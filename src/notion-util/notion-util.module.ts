import { Global, Module } from '@nestjs/common';
import { NotionUtilService } from './notion-util.service';

@Global()
@Module({
  providers: [NotionUtilService],
  exports: [NotionUtilService]
})
export class NotionUtilModule {}
