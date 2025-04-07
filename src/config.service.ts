import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({
    region: 'ap-south-1', // Mumbai region
});

async function getSSMParameter(name: string): Promise<string | undefined> {
    try {
        const command = new GetParameterCommand({
            Name: name,
            WithDecryption: true, // Decrypt SecureString parameters
        });

        const data = await ssmClient.send(command);
        return data.Parameter?.Value;
    } catch (error) {
        console.error(`Error retrieving parameter ${name}:`, error);
        return undefined;
    }
}

export async function loadConfig() {
    const masterDBID = await getSSMParameter('/my-app/MASTER_DB_ID');
    const apiKey = await getSSMParameter('/my-app/NOTION_API_KEY');
    const notionVersion = await getSSMParameter('/my-app/NOTION_VERSION');

    return {
        MASTER_DB_ID: masterDBID,
        NOTION_API_KEY: apiKey,
        NOTION_VERSION: notionVersion,
    };
}
