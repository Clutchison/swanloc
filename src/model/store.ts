import { TableDef } from "../db/dao.js";

export class Store {

  readonly name: string;
  readonly wizId: number;

  static readonly table = 'STORE' as const;
  public static readonly tableDef: TableDef = {
    columns: [
      {
        name: 'name',
        type: 'TEXT',
      },
      {
        name: 'wizId',
        type: 'NUM',
      },
    ],
    name: 'STORE'
  } as const;

  public values(): any[] {
    return [this.name, this.wizId];
  }

  constructor(name: string, wizId: number) {
    this.name = name;
    this.wizId = wizId;
  }
}
