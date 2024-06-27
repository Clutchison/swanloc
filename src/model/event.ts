import { TableDef } from "./db/dao.js";

export type Event = {
  readonly id?: number | null;
  readonly name: string;
  readonly storeWizId: number;
  readonly price: number;
  readonly date: string;
  readonly description: string;
  readonly isPosted?: number;
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
      name: 'storeWizId',
      type: 'INTEGER',
    },
    {
      name: 'price',
      type: 'INTEGER',
    },
    {
      name: 'date',
      type: 'TEXT',
    },
    {
      name: 'description',
      type: 'TEXT',
    },
    {
      name: 'isPosted',
      type: 'INTEGER',
    },
  ],
  name: 'EVENT'
} as const;
