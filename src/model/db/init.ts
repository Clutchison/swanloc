import { EVENT_DEF, Event } from "../event.js";
import { Store, STORE_DEF } from "../store.js";
import { Tag, TAG_DEF } from "../tag.js";
import { Dao, TableDef } from "./dao.js";

export function initTables() {
  Dao.db.serialize(() => {
    initTable(STORE_DEF, STORES);
    initTable(TAG_DEF, TAGS);
    initTable(EVENT_DEF, EVENTS);
  });
}

function initTable(ref: TableDef, vals: any[]) {
  const dao = Dao.get(ref);
  vals.forEach(s => dao.insert(s));
  console.log(`Initialized ${ref.name}. Rows:`);
  Dao.db.each(`SELECT * from ${ref.name}`, (err, row) =>
    console.log(!!err ? err : JSON.stringify(row))
  );
}

const STORES: Store[] = [
  { name: 'DCG Lomas', wizId: 13642, },
] as const;

const TAGS: Tag[] = [
  { name: 'Booster Draft' },
  { name: 'Commander' },
  { name: 'Friday Night Magic' },
  { name: 'Sealed Deck' },
  { name: 'Regional Championship Qualifier' },
  { name: 'Magic Prerelease' },
] as const;

const EVENTS: Event[] = [
  {
    name: 'Test Event',
    storeWizId: 13642,
    price: 3000,
    date: 1,
    description: 'Test Event',
    isPosted: 0
  }
]
