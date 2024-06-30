import { Dao } from "./db/dao.js";
import { TableDef } from "./db/table-def.js";

export type Tag = {
  readonly id?: number | null;
  readonly name: string;
  postAllowance?: PostAllowance;
}

export const POST_ALLOWANCES = [
  'whitelisted',
  'blacklisted',
  'none',
] as const;
export type PostAllowance = typeof POST_ALLOWANCES[number];

export const TAG_DEF: TableDef = {
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
      name: 'postAllowance',
      type: 'postallowance',
      default: 'none'
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
      type: 'serial',
      primary: true,
    },
    {
      name: 'tagId',
      type: 'integer',
    },
    {
      name: 'eventId',
      type: 'integer',
    },
  ],
  multiUnique: [
    'tagId',
    'eventId',
  ],
  name: 'EVENT_TAG'
} as const;

export class TagDao {
  static async getFNM() {
    const res = await Dao.query(
      "SELECT * FROM TAG WHERE NAME = 'Friday Night Magic'",
      '[GET FNM]'
    );
    return res.rows[0];
  }
}


