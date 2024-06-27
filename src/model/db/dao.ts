import config from '../../../config.json' assert {type: 'json'};
import sqlite3, { Database, RunResult } from 'sqlite3';
import { Tag } from '../tag.js';

export class Dao {

  private static instanceMap: { [key in string]: Dao } = {};
  public static db: Database = new (config.env === 'dev' ? sqlite3.verbose() : sqlite3).Database(config.db);

  public def: TableDef;

  private constructor(def: TableDef) {
    this.def = def;
    this.createTable();
  }

  public static instance(def: TableDef): Dao {
    const existingDao: Dao | undefined = Dao.instanceMap[def.name];
    if (!existingDao) {
      const newDao = new Dao(def);
      Dao.instanceMap[def.name] = newDao;
      return newDao;
    } else {
      return existingDao;
    }
  }

  public insert<T extends {}>(obj: T): Promise<T> {
    const [keys, values] = [Object.keys(obj), Object.values(obj)];
    console.log(`VALUES - ${JSON.stringify(values)}`)
    const s = `INSERT INTO ${this.def.name} (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${values.map(_ => '?').join(', ')});`;
    // console.log('[INSERT] ' + Dao.populate(values, JSON.stringify(s)));
    return new Promise<T>((resolve, reject) => {
      const dao = this;
      Dao.db.prepare(s).run(values, function(this: RunResult, err: Error) {
        if (!!err) reject(err);
        else resolve(dao.getById<T>(this.lastID));
      });
    })
  }

  private static populate(vals: any[], s: string): string {
    return vals.length === 0 ? s : Dao.populate(vals, s.replace('?', vals.shift()));
  }

  public createTable() {
    const colString = this.def.columns.map(Dao.formatColumnDef).join(', ');
    const s = `CREATE TABLE IF NOT EXISTS ${this.def.name} (` + colString + ')';
    console.log('[CreateTable] ' + s);
    Dao.db.run(s);
  }

  getById<T>(id: number): Promise<T> {
    const s = `SELECT * FROM ${this.def.name} where id = ${id}`;
    console.log('[GET BY ID] ' + s);
    return new Promise((resolve, reject) => {
      Dao.db.get(s, (err: Error, row: T) => {
        if (!!err) reject(err);
        else resolve(row);
      })
    });
  }

  getAll<T>(): Promise<T[]> {
    const s = `SELECT * FROM ${this.def.name}`
    console.log('[GET ALL] ' + s);
    return new Promise((resolve, reject) => {
      Dao.db.all(s, function(err: Error, res: any) {
        if (!!err) reject(err);
        else resolve(res as T[])
      });
    });
  }

  private static formatColumnDef(c: Column) {
    return c.name + ' ' + c.type +
      (c.primary ? ' PRIMARY KEY autoincrement' : '') +
      (c.unique ? ' unique' : '');
  }
}

export type TableDef = {
  columns: Columns;
  name: string;
}

export type Column = {
  name: string;
  type: ColumnType;
  unique?: boolean;
  primary?: boolean;
}

export type Columns = Column[]

export type ColumnType = 'TEXT' | 'NUM' | 'INTEGER' | 'REAL' | '';
