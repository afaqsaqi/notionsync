export interface NotionProperty {
    id?: string;
    type?: string;
}

export interface NotionPeople extends NotionProperty {
    people: { id: string }[];
}

export interface NotionStatus extends NotionProperty {
    status: { id: string } | null;
}

export interface NotionCheckbox extends NotionProperty {
    checkbox: boolean;
}

export interface NotionRichText extends NotionProperty {
    rich_text: { text: { content: string } }[];
}

export interface NotionNumber extends NotionProperty {
    number: number | null;
}

export interface NotionDate extends NotionProperty {
    date: string | null;
}

export interface NotionSelect extends NotionProperty {
    select: { name: string } | null;
}

export interface NotionMultiSelect extends NotionProperty {
    multi_select: { name: string }[];
}

export interface NotionRelation extends NotionProperty {
    relation: { id: string }[];
}

export interface NotionFormula extends NotionProperty {
    formula: { type: string; string: string };
}

export interface NotionTitle extends NotionProperty {
    title: { text: { content: string } }[];
}

interface NotionDateProperty {
    date: {
        start: string | null;
        end: string | null;
        time_zone: string | null;
    };
}

export interface NotionMasterItem {
    properties: {
        Assignee: NotionPeople;
        CID: NotionRichText;
        Progress: NotionNumber;
        Due: NotionDate;
        "Task name": NotionTitle;
        Description: NotionRichText;
        LastSyncedAt: NotionDateProperty;
        StatusText: NotionRichText;
        Sync: NotionCheckbox;
    };
}

export interface NotionSlaveItem {
    properties: {
        Assignee: NotionPeople;
        CID: NotionRichText;
        Progress: NotionNumber;
        Due: NotionDate;
        "Task name": NotionTitle;
        Description: NotionRichText;
        LastSyncedAt: NotionDateProperty;
        StatusText: NotionRichText;
    };
}
