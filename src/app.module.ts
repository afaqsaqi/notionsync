import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasktrackerModule } from './tasktracker/tasktracker.module';
import { NotionUtilModule } from './notion-util/notion-util.module';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal: true,
        envFilePath: `.env.${process.env.NODE_ENV}`
      }
    ),
    TasktrackerModule,
    NotionUtilModule,
  ],
  controllers: [AppController, ],
  providers: [AppService],
})
export class AppModule {}
