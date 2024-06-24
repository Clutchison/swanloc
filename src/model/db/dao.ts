import config from '../../../config.json' assert {type: 'json'};
import sqlite3, { Database } from 'sqlite3';

export class Dao {

  private static instanceMap: { [key in string]: Dao } = {};

  public static db: Database = new (config.env === 'dev' ? sqlite3.verbose() : sqlite3).Database(config.db);
  public def: TableDef;

  private constructor(def: TableDef) {
    this.def = def;
    this.createTable();
  }

  public static get(def: TableDef): Dao {
    const existingDao: Dao | undefined = Dao.instanceMap[def.name];
    if (!existingDao) {
      const newDao = new Dao(def);
      Dao.instanceMap[def.name] = newDao;
      return newDao;
    } else {
      return existingDao;
    }
  }

  public insert(obj: any) {
    console.log('In const');
    const values = Dao.values(obj);
    const s = `INSERT INTO ${this.def.name} VALUES (${values.map(_ => '?').join(', ')})`;
    console.log('[INSERT] ' + s);
    Dao.db.prepare(s).run(values);
  }

  public createTable() {
    const colString = this.def.columns.map(Dao.formatColumnDef).join(', ');
    const s = `CREATE TABLE IF NOT EXISTS ${this.def.name} (` + colString + ')';
    console.log('[CreateTable] ' + s);
    Dao.db.run(s);
  }

  private static formatColumnDef(c: Column) {
    const s = c.name + ' ' + c.type +
      (c.primary ? ' PRIMARY KEY autoincrement' : '') +
      (c.unique ? ' unique' : '');
    return s;
  }

  private static values(obj: any) {
    const objWithId = {
      id: null,
      ...obj
    }
    return Object.keys(objWithId)
      .filter(k => k !== 'def')
      .map(k => obj[k]);
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
