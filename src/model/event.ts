import { TableDef } from "./db/dao.js";

export type Store = {
  readonly id?: number | null;
  readonly name: string;
  readonly wizId: number;
}

export const STORE_DEF: TableDef = {
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
  name: 'STORE'
} as const;
