import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { NotionMasterItem, NotionSlaveItem } from 'src/notion-payload';

@Injectable()
export class NotionUtilService {
    private readonly logger = new Logger(NotionUtilService.name);
    private readonly notionApiUrl = 'https://api.notion.com/v1';
    private readonly headers = {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': process.env.NOTION_VERSION,
        'Content-Type': 'application/json',
    };

    async fetchDatabaseItems(databaseId: string, filter?: any): Promise<any[]> {
        try {
            const requestBody: any = {};
            if (filter) {
                requestBody.filter = filter;
            }

            const response = await axios.post(
                `${this.notionApiUrl}/databases/${databaseId}/query`,
                requestBody,
                { headers: this.headers }
            );

            return response.data.results;
        } catch (error) {
            this.logger.error(`Error fetching items from database ${databaseId}`, error);
            return [];
        }
    }


    async updateItemInDatabase(itemId: string, updatePayload: any) {
        try {
            await axios.patch(`${this.notionApiUrl}/pages/${itemId}`, updatePayload, { headers: this.headers });
            this.logger.log(`Updated item ${itemId}`);
        } catch (error) {
            this.logger.error(`Error updating item ${itemId}`, error);
        }
    }

    async createNewItemInDatabase(databaseId: string, updatePayload: any): Promise<any | null> {
        try {
            const response = await axios.post(
                `${this.notionApiUrl}/pages`,
                {
                    parent: { database_id: databaseId },
                    properties: updatePayload.properties,
                },
                { headers: this.headers }
            );

            const newItemId = response.data;
            this.logger.log(`Created new item in database ${databaseId} with ID ${newItemId}`);
            return newItemId;
        } catch (error) {
            this.logger.error(`Error creating new item in database ${databaseId}`, error);
            return null;
        }
    }

    async updateMasterDatabaseItem(masterItemId: string, newItemId: string) {
        try {
            await axios.patch(
                `${this.notionApiUrl}/pages/${masterItemId}`,
                {
                    properties: {
                        'CID': { rich_text: [{ text: { content: newItemId } }] },
                    },
                },
                { headers: this.headers }
            );
            this.logger.log(`Updated Master Database item ${masterItemId} with new Corresponding Item ID ${newItemId}`);
        } catch (error) {
            this.logger.error(`Error updating Master Database item ${masterItemId}`, error);
        }
    }

    async fetchItemById(itemId: string): Promise<NotionMasterItem | null> {
        try {
            const response = await axios.get(
                `${this.notionApiUrl}/pages/${itemId}`,
                { headers: this.headers }
            );

            // Check if the item exists
            return this.getNotionMasterItemWith(response.data);
        } catch (error) {
            this.logger.error(`Error fetching item with ID ${itemId}`, error);
            return null;
        }
    }

    getNotionMasterItemWith(properties: any): NotionMasterItem {
        return {
            properties: {
                Assignee: {
                    people: properties.Assignee.people.map((person: any) => ({ id: person.id })),
                },
                CID: {
                    rich_text: properties.CID.rich_text.map((text: any) => ({
                        text: { content: text.plain_text },
                    })),
                },
                Progress: {
                    number: properties.Progress.number,
                },
                "Due": {
                    date: properties.Due.date,
                },
                "Task name": {
                    title: properties["Task name"].title.map((text: any) => ({
                        text: { content: text.plain_text },
                    })),
                },
                Description: {
                    rich_text: properties.Description.rich_text.map((text: any) => ({
                        text: { content: text.plain_text },
                    })),
                },
                LastSyncedAt: {
                    date: properties.LastSyncedAt.date,
                },
                StatusText: {
                    rich_text: properties.StatusText.rich_text.map((text: any) => ({
                        text: { content: text.plain_text },
                    })),
                },
                Sync: {
                    checkbox: properties?.Sync?.checkbox || false
                }
            },
        };
    }

    getNotionSlaveItemWith(properties: any): NotionSlaveItem {
        return {
            properties: {
                Assignee: {
                    people: properties.Assignee.people.map((person: any) => ({ id: person.id })),
                },
                CID: {
                    rich_text: properties.CID.rich_text.map((text: any) => ({
                        text: { content: text.plain_text },
                    })),
                },
                Progress: {
                    number: properties.Progress.number,
                },
                "Due": {
                    date: properties.Due.date,
                },
                "Task name": {
                    title: properties["Task name"].title.map((text: any) => ({
                        text: { content: text.plain_text },
                    })),
                },
                Description: {
                    rich_text: properties.Description.rich_text.map((text: any) => ({
                        text: { content: text.plain_text },
                    })),
                },
                LastSyncedAt: {
                    date: properties.LastSyncedAt.date,
                },
                StatusText: {
                    rich_text: properties.StatusText.rich_text.map((text: any) => ({
                        text: { content: text.plain_text },
                    })),
                }
            },
        };
    }

    async replacePageContent(targetPageId: string, sourcePageId: string) {
        try {
            // 1. Fetch source blocks
            const sourceBlocks = await axios.get(
                `https://api.notion.com/v1/blocks/${sourcePageId}/children`,
                { headers: this.headers }
            );

            const existingBlocks = await axios.get(
                `https://api.notion.com/v1/blocks/${targetPageId}/children`,
                { headers: this.headers }
            );

            for (const block of existingBlocks.data.results) {
                await axios.delete(`https://api.notion.com/v1/blocks/${block.id}`, {
                    headers: this.headers,
                });
            }

            for (const block of sourceBlocks.data.results) {
                await axios.patch(
                    `https://api.notion.com/v1/blocks/${targetPageId}/children`,
                    { children: [block] },
                    { headers: this.headers }
                );
            }

            this.logger.log(`Replaced content of page ${targetPageId} with blocks from ${sourcePageId}`);
        } catch (error) {
            this.logger.error(`Error syncing block content`, error.response.data || error.message);
        }
    }

}
