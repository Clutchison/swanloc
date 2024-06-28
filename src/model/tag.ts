import { TableDef } from "./db/dao.js";

export type Tag = {
  readonly id?: number | null;
  readonly name: string;
  postable?: number;
}

export const TAG_DEF: TableDef = {
  columns: [
    {
      name: 'id',
      type: 'INTEGER',
      primary: true,
    },
    {
      name: 'name',
      type: 'TEXT',
    },
    {
      name: 'postable',
      type: 'INTEGER',
    },
  ],
  name: 'TAG'
} as const;


export type EventTag = {
  readonly id?: number | null;
  readonly tagId: number;
  readonly eventId: number;
}

export const EVENT_TAG_DEF: TableDef = {
  columns: [
    {
      name: 'id',
      type: 'INTEGER',
      primary: true,
    },
    {
      name: 'tagId',
      type: 'INTEGER',
    },
    {
      name: 'eventId',
      type: 'INTEGER',
    },
  ],
  multiUnique: [
    'tagId',
    'eventId',
  ],
  name: 'EVENT_TAG'
} as const;
