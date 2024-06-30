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
  default?: any;
}

export type Columns = Column[]

const COLUMN_TYPE = [
  'serial',
  'smallserial',
  'boolean',
  'varchar',
  'timestamp',
  'integer',
  'text',
  'postallowance',
] as const;
export type ColumnType = typeof COLUMN_TYPE[number];
