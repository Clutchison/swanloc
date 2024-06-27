import { EVENT_DEF, Event } from "../event.js";
import { Store, STORE_DEF } from "../store.js";
import { EVENT_TAG_DEF, EventTag, Tag, TAG_DEF } from "../tag.js";
import { Dao, TableDef } from "./dao.js";

export async function initTables() {
  Dao.db.serialize(() => {
    initTable<Store>(STORE_DEF, STORES);
    initTable<EventTag>(EVENT_TAG_DEF, [])
    initTable<Tag>(TAG_DEF, TAGS);
    initTable<Event>(EVENT_DEF, EVENTS);
  });
}

function initTable<T extends {}>(ref: TableDef, vals: any[]) {
  const dao = Dao.instance(ref);
  vals.forEach(s => dao.insert<T>(s)
    .then(res => console.log(`RETURNED --- ${JSON.stringify(res)}`))
    .catch(e => console.log(e)));
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
