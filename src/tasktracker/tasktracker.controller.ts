import { Controller, Get, Param, Post, } from '@nestjs/common';
import { TasktrackerService } from './tasktracker.service';

@Controller('tasktracker')
export class TasktrackerController {

    constructor(private tasktrackerService: TasktrackerService) { }

    @Post('sync')
    sync() {
        this.tasktrackerService.syncMasterDatabaseToSlave();
        return "Synced from master to slave";
    }

    @Post('/:dbid')
    syncSlaveToMasterWith(@Param('dbid') dbid: string) {
        this.tasktrackerService.syncSlaveDatabaseToMaster(dbid);
        return "Synced from slave to master";
    }

}
