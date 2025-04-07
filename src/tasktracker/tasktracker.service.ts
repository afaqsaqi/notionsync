import { Injectable, Logger } from '@nestjs/common';

import { NotionUtilService } from '../notion-util/notion-util.service';

@Injectable()
export class TasktrackerService {
    private readonly logger = new Logger(TasktrackerService.name);

    constructor(private notionUtilService: NotionUtilService) { }

    async syncMasterDatabaseToSlave() {
        try {

            const filter = { "property": "Sync", "checkbox": { "equals": true } }
            const masterItems = await this.notionUtilService.fetchDatabaseItems(process.env.MASTER_DB_ID || "", filter);

            for (const item of masterItems) {
                const correspondingItemId = item.properties['CID']?.rich_text?.[0]?.plain_text;
                const lastEditedBy = item.properties.LastEditedBy.last_edited_by.name;
                const status = item.properties.Status?.status.name || null;

                if (lastEditedBy === 'make') {
                    continue;
                }

                let notionSlaveItem = this.notionUtilService.getNotionSlaveItemWith(item.properties);
                notionSlaveItem.properties.LastSyncedAt = {
                    date: {
                        start: new Date().toISOString(), // Converts to YYYY-MM-DD
                        end: null,
                        time_zone: null,
                    },
                };

                notionSlaveItem.properties.StatusText = {
                    rich_text: [
                        {
                            text: {
                                content: status,
                            }
                        }
                    ]
                };

                if (correspondingItemId) {
                    notionSlaveItem.properties.CID = {
                        rich_text: [
                            {
                                text: {
                                    content: item.id
                                }
                            }
                        ]
                    }
                    await this.notionUtilService.updateItemInDatabase(correspondingItemId, notionSlaveItem);
                    await this.notionUtilService.updateItemInDatabase(item.id, {
                        properties: {
                            LastSyncedAt: {
                                date: {
                                    start: new Date().toISOString(),
                                    end: null,
                                    time_zone: null,
                                },
                            }
                        }
                    });
                } else {
                    notionSlaveItem.properties.CID = {
                        rich_text: [
                            {
                                text: {
                                    content: item.id
                                }
                            }
                        ]
                    };

                    const CDBID = item.properties.CDBID?.rich_text?.[0]?.plain_text;
                    if (CDBID) {
                        const newItem = await this.notionUtilService.createNewItemInDatabase(CDBID, notionSlaveItem);
                        if (newItem.id) {
                            await this.notionUtilService.updateMasterDatabaseItem(item.id, newItem.id);
                        }
                    }
                }
            }
        } catch (error) {
            this.logger.error('Error syncing master database', error);
        }
    }

    async syncSlaveDatabaseToMaster(dbid: string) {
        try {
            const slaveItems = await this.notionUtilService.fetchDatabaseItems(dbid);

            for (const item of slaveItems) {
                const correspondingItemId = item.properties['CID']?.rich_text?.[0]?.plain_text;
                const lastEditedBy = item.properties.LastEditedBy.last_edited_by.name;
                const status = item.properties.Status?.status.name || null;

                // Skip the item if lastEditedBy is 'make'
                if (lastEditedBy === 'make' || !correspondingItemId || status === 'Archived') {
                    continue;
                }

                let notionItem = this.notionUtilService.getNotionMasterItemWith(item.properties);
                notionItem.properties.LastSyncedAt = {
                    date: {
                        start: new Date().toISOString(), // Full ISO Date and Time
                        end: null,
                        time_zone: null,
                    },
                };

                notionItem.properties.StatusText = {
                    rich_text: [
                        {
                            text: {
                                content: status,
                            }
                        }
                    ]
                };

                notionItem.properties.Sync = {
                    checkbox: true
                }

                if (correspondingItemId) {
                    notionItem.properties.CID = {
                        rich_text: [
                            {
                                text: {
                                    content: item.id
                                }
                            }
                        ]
                    }
                    await this.notionUtilService.updateItemInDatabase(correspondingItemId, notionItem);
                    await this.notionUtilService.updateItemInDatabase(item.id, {
                        properties: {
                            LastSyncedAt: {
                                date: {
                                    start: new Date().toISOString(),
                                    end: null,
                                    time_zone: null,
                                },
                            }
                        }
                    });
                }
            }
        } catch (error) {
            this.logger.error('Error syncing slave database to master database', error);
        }
    }
}
