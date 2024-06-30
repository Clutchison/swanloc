import { TableDef } from "./db/table-def.js";

export type Store = {
  readonly id?: number | null;
  readonly name: string;
  readonly wizId: number;
  readonly location?: string;
  readonly phone?: string;
  readonly isPremium?: boolean;
}

export const STORE_DEF: TableDef = {
  columns: [
    {
      name: 'id',
      type: 'smallserial',
      primary: true,
    },
    {
      name: 'name',
      type: 'varchar',
    },
    {
      name: 'wizId',
      type: 'integer',
      unique: true,
    },
    {
      name: 'location',
      type: 'varchar',
    },
    {
      name: 'phone',
      type: 'varchar',
    },
    {
      name: 'isPremium',
      type: 'boolean',
      default: false,
    },
  ],
  name: 'STORE'
} as const;
