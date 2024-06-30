import pg, { Client } from 'pg';
import { Column, TableDef } from './table-def.js';

export class Dao {

  private static instanceMap: { [key in string]: Dao } = {};
  public static client: Client = new pg.Client({
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || '',
    port: +(process.env.DB_PORT || 0),
    database: process.env.DB_NAME || '',
  });

  public def: TableDef;

  private constructor(def: TableDef) {
    this.def = def;
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

  public static async createType(vals: readonly string[], name: string) {
    await Dao.query(
      `CREATE TYPE "${name}" AS ENUM (${vals.map(v => "'" + v + "'").join(', ')})`,
      '[CREATE TYPE]',
    );
    return;
  }

  public static async dropType(name: string) {
    await Dao.query(
      `DROP TYPE IF EXISTS "${name}"`,
      '[DROP TYPE]',
    );
    return;
  }

  public async drop() {
    await Dao.query(
      `DROP TABLE IF EXISTS ${this.def.name}`,
      '[DROP TABLE]',
    )
    return;
  }

  public async insert<T extends {}>(obj: T): Promise<T> {
    const [keys, values] = [Object.keys(obj), Object.values(obj)];
    console.log('INSERT VALUES');
    console.log(JSON.stringify(values));
    const response = await Dao.query(
      `INSERT INTO ${this.def.name} (${keys.map(k => `"${k}"`).join(', ')}) ` +
      `VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
      '[INSERT]',
      ...values,
    )
    return response.rows[0] as T;
  }

  public async createTable(): Promise<void> {
    const q = `CREATE TABLE ${this.def.name} (` + this.def.columns.map(Dao.formatColumnDef).join(', ') +
      (!!this.def.multiUnique ? `, CONSTRAINT ${this.def.name}_unique UNIQUE(${this.def.multiUnique.map(k => `"${k}"`).join(', ')}))` : ')');
    await Dao.query(q, '[CREATE TABLE]');
  }

  public async getBy<T extends {}>(t: T, ...cols: string[]): Promise<T[]> {
    const response = await Dao.query(
      `SELECT * FROM ${this.def.name} where ${cols.map((col, i) => col + '=$' + i + 1).join(' and ')}`,
      '[GET BY]',
      cols.map(c => t[c as keyof T])
    );
    return response.rows;
  }

  public async getById<T>(id: number): Promise<T> {
    const response = await Dao.query(
      `SELECT * FROM ${this.def.name} where id = ${id}`,
      '[GET BY ID]',
      id
    );
    return response.rows[0];
  }

  public async getAll<T>(): Promise<T[]> {
    const response = await Dao.query(
      `SELECT * FROM ${this.def.name}`,
      '[GET ALL]',
    )
    return response.rows;
  }

  private static populate(vals: any[], s: string): string {
    return vals.length === 0 ? s : Dao.populate(vals, s.replace(/\$\d\d?/i, vals.shift()));
  }

  public static async query(q: string, logPrefix: string, ...values: any[]) {
    console.log(logPrefix + ' ' + Dao.populate([...values], Object.assign(q, '')));
    return await Dao.client.query({
      text: q,
      values: values
    });
  }

  private static formatColumnDef(c: Column) {
    const s = `"${c.name}"` + ' ' + c.type +
      (c.primary ? ' PRIMARY KEY' : '') +
      (c.unique ? ' UNIQUE' : '') +
      (c.default !== undefined ? ' DEFAULT ' + `'${c.default}'` : '');
    return s;
  }
}
