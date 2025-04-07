// notion-utils.ts
import axios from 'axios';
import { Logger } from '@nestjs/common';

const notionApiUrl = 'https://api.notion.com/v1';
const headers = {
    'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
    'Notion-Version': process.env.NOTION_VERSION,
    'Content-Type': 'application/json',
};

export const fetchDatabaseItems = async (databaseId: string, logger: Logger): Promise<any[]> => {
    try {
        const response = await axios.post(
            `${notionApiUrl}/databases/${databaseId}/query`,
            { filter: { property: 'Sync', checkbox: { equals: true } } },
            { headers }
        );
        return response.data.results;
    } catch (error) {
        logger.error(`Error fetching items from database ${databaseId}`, error);
        return [];
    }
};

export const updateItemInDatabase = async (itemId: string, updatePayload: any, logger: Logger) => {
    try {
        await axios.patch(`${notionApiUrl}/pages/${itemId}`, updatePayload, { headers });
        logger.log(`Updated item ${itemId}`);
    } catch (error) {
        logger.error(`Error updating item ${itemId}`, error);
    }
};