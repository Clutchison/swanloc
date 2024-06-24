import { TableDef } from "./db/dao.js";

export type Event = {
  readonly id?: number | null;
  readonly name: string;
  readonly storeWizId: number;
  readonly price: number;
  readonly date: string;
  readonly description: string;
}

export const EVENT_DEF: TableDef = {
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
      name: 'wizId',
      type: 'INTEGER',
      unique: true,
    },
  ],
  name: 'EVENT'
} as const;
