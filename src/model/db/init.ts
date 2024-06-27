import { EVENT_DEF, Event } from "../event.js";
import { Store, STORE_DEF } from "../store.js";
import { Tag, TAG_DEF } from "../tag.js";
import { Dao, TableDef } from "./dao.js";

export async function initTables() {
  Dao.db.serialize(() => {
    initTable<Store>(STORE_DEF, STORES);
    initTable<Tag>(TAG_DEF, TAGS);
    initTable<Event>(EVENT_DEF, EVENTS);
  });
}

function initTable<T extends {}>(ref: TableDef, vals: any[]) {
  const dao = Dao.instance(ref);
  vals.forEach(s => dao.insert<T>(s)
    .then(res => console.log(`RETURNED --- ${JSON.stringify(res)}`))
    .catch(e => console.log(e)));
  // Dao.db.all(`SELECT * from ${ref.name}`, function(err, rows) {
  //   if (!!err) console.log(err);
  //   else {
  //     console.log('Rows in ' + ref.name);
  //     console.log(JSON.stringify(rows))
  //   }
  // });
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
    date: 'date',
    description: 'Test Event',
    isPosted: 0
  }
]
