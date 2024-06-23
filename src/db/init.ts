import { Store } from "../model/store.js";
import { Dao } from "./dao.js";

export function init(dao: Dao) {
  dao.createTable(Store.tableDef);
}
