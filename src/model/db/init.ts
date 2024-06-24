import { Store, STORE_DEF } from "../store.js";
import { Dao } from "./dao.js";

export function init() {
  initStores();
}

function initStores() {
  console.log('In init stores');
  Dao.db.serialize(() => {
    const dao = Dao.get(STORE_DEF);
    STORES.forEach(s => dao.insert(s));
    Dao.db.each('SELECT * from STORE', (err, row) => {
      if (!!err) {
        console.log(err);
      } else {
        console.log(JSON.stringify(row));
      }
    });
  });
}

const STORES: Store[] = [
  {
    name: 'DCG Lomas',
    wizId: 13642,
  },
] as const;
