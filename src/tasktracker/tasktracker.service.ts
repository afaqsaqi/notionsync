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
                const targetItemId = item.properties['CID']?.rich_text?.[0]?.plain_text;
                const lastEditedBy = item.properties.LastEditedBy.last_edited_by.name;
                const status = item.properties.Status?.status.name || null;

                if (lastEditedBy === 'Automation') {
                    continue;
                }

                let sourceItem = this.notionUtilService.getNotionSlaveItemWith(item.properties);
                sourceItem.properties.LastSyncedAt = {
                    date: {
                        start: new Date().toISOString(), // Converts to YYYY-MM-DD
                        end: null,
                        time_zone: null,
                    },
                };

                sourceItem.properties.StatusText = {
                    rich_text: [
                        {
                            text: {
                                content: status,
                            }
                        }
                    ]
                };

                if (targetItemId) {
                    sourceItem.properties.CID = {
                        rich_text: [
                            {
                                text: {
                                    content: item.id
                                }
                            }
                        ]
                    }
                    await this.notionUtilService.updateItemInDatabase(targetItemId, sourceItem);
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
                    await this.notionUtilService.replacePageContent(targetItemId, item.id);
                } else {
                    sourceItem.properties.CID = {
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
                        const newItem = await this.notionUtilService.createNewItemInDatabase(CDBID, sourceItem);
                        if (newItem.id) {
                            await this.notionUtilService.updateMasterDatabaseItem(item.id, newItem.id);
                            await this.notionUtilService.replacePageContent(newItem.id, item.id);
                        }
                    }
                }
            }
        } catch (error) {
            console.log("Failed to sync with error: ", error);
        }
    }

    async syncSlaveDatabaseToMaster(dbid: string) {
        try {
            const slaveItems = await this.notionUtilService.fetchDatabaseItems(dbid);

            for (const item of slaveItems) {
                const targetItemId = item.properties['CID']?.rich_text?.[0]?.plain_text;
                const lastEditedBy = item.properties.LastEditedBy.last_edited_by.name;
                const status = item.properties.Status?.status.name || null;

                // Skip the item if lastEditedBy is 'make'
                if (lastEditedBy === 'make' || !targetItemId || status === 'Archived') {
                    continue;
                }

                let sourceItem = this.notionUtilService.getNotionMasterItemWith(item.properties);
                sourceItem.properties.LastSyncedAt = {
                    date: {
                        start: new Date().toISOString(), // Full ISO Date and Time
                        end: null,
                        time_zone: null,
                    },
                };

                sourceItem.properties.StatusText = {
                    rich_text: [
                        {
                            text: {
                                content: status,
                            }
                        }
                    ]
                };

                sourceItem.properties.Sync = {
                    checkbox: true
                }

                if (targetItemId) {
                    sourceItem.properties.CID = {
                        rich_text: [
                            {
                                text: {
                                    content: item.id
                                }
                            }
                        ]
                    }
                    await this.notionUtilService.updateItemInDatabase(targetItemId, sourceItem);
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
                await this.notionUtilService.replacePageContent(targetItemId, item.id);
            }
        } catch (error) {
            this.logger.error('Error syncing slave database to master database', error);
        }
    }
}
