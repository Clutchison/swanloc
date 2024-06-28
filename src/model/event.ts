import { Database } from "sqlite3";
import { Dao, TableDef } from "./db/dao.js";

export type Event = {
  readonly id?: number | null;
  readonly name: string;
  readonly storeWizId: number;
  readonly price: number;
  readonly date: string;
  readonly description: string;
  readonly isPosted?: number;
  readonly url?: string;
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
    {
      name: 'url',
      type: 'TEXT',
    },
  ],
  name: 'EVENT',
  multiUnique: [
    'name',
    'storeWizId',
    'date'
  ]
} as const;

export class EventDao {
  static async post(e: Event) {
    return new Promise((resolve, reject) => {
      if (!!e.id && !!e.url) {
        const s = `UPDATE EVENT SET url=?, isPosted=1 WHERE id=?`;
        Dao.db.run(s, [e.url, e.id], (err: Error, row: Event) => {
          if (!!err) reject(err);
          else resolve(row);
        });
      } else reject('Event is missing id or url');
    })
  }
}
