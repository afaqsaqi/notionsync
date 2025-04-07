import { Module } from '@nestjs/common';
import { TasktrackerController } from './tasktracker.controller';
import { TasktrackerService } from './tasktracker.service';

@Module({
  controllers: [TasktrackerController],
  providers: [TasktrackerService]
})
export class TasktrackerModule {}
