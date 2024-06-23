import config from '../../config.json' assert {type: 'json'};
import sqlite3, { Database } from 'sqlite3';

export class Dao {

  private static instance?: Dao;

  public readonly db: Database;

  private constructor() {
    const sql = config.env === 'dev' ? sqlite3.verbose() : sqlite3;
    this.db = new sql.Database(':memory:');
  }

  public static get(): Dao {
    if (!Dao.instance) Dao.instance = new Dao();
    return Dao.instance;
  }

  public insert(table: string, values: any[]) {
    const stmt = this.db.prepare(`INSERT INTO ${table} VALUES (?, ?)`);
    stmt.run(values);
  }

  public createTable(def: TableDef) {
    const stmt = `CREATE TABLE ${def.name} (${def.columns.map(c => c.name + ' ' + c.type).join(', ')})`;
    console.log(stmt);
    this.db.run(stmt);
  }
}

export type TableDef = {
  columns: Columns;
  name: string;
}

export type Columns = {
  name: string;
  type: ColumnType;
}[]

export type ColumnType = 'TEXT' | 'NUM' | 'INT' | 'REAL' | '';
