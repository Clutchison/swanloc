import { Client } from 'pg';

export class Dao {

  private static instanceMap: { [key in string]: Dao } = {};
  public static client: Client = new Client();

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

  public async insert<T extends {}>(obj: T): Promise<T> {
    const [keys, values] = [Object.keys(obj), Object.values(obj)];
    const response = await Dao.query(
      `INSERT INTO ${this.def.name} (${keys.map(k => `"${k}"`).join(', ')}) ` +
      `VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
      '[INSERT]',
      values,
    )
    return response.rows[0] as T;
  }

  public async createTable(): Promise<void> {
    await Dao.query(
      `CREATE TABLE ${this.def.name} (` + this.def.columns.map(Dao.formatColumnDef).join(', ') +
      (!!this.def.multiUnique ? `, CONSTRAINT ${this.def.name}_unique UNIQUE(${this.def.multiUnique.join(', ')}))` : ')'),
      '[CREATE TABLE]',
    )
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

  private static async query(q: string, logPrefix: string, ...values: any[]) {
    console.log(logPrefix + ' ' + Dao.populate([...values], Object.assign(q, '')));
    return await Dao.client.query(q, values);
  }

  private static formatColumnDef(c: Column) {
    return c.name + ' ' + c.type +
      (c.primary ? ' PRIMARY KEY' : '') +
      (c.unique ? ' UNIQUE' : '');
  }
}

export type TableDef = {
  columns: Columns;
  name: string;
  multiUnique?: string[];
}

export type Column = {
  name: string;
  type: ColumnType;
  unique?: boolean;
  primary?: boolean;
}

export type Columns = Column[]

export type ColumnType = 'TEXT' | 'NUM' | 'INTEGER' | 'REAL' | '';
