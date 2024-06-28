import { EVENT_DEF, Event } from "../event.js";
import { Store, STORE_DEF } from "../store.js";
import { EVENT_TAG_DEF, EventTag, Tag, TAG_DEF } from "../tag.js";
import { Dao, TableDef } from "./dao.js";

export async function initTables(): Promise<void> {
  return new Promise((resolve, _) => {
    resolve(Dao.db.serialize(() => {
      Dao.instance(STORE_DEF).createTable();
      Dao.instance(EVENT_DEF).createTable();
      Dao.instance(TAG_DEF).createTable();
      Dao.instance(EVENT_TAG_DEF).createTable();
      initTable<Store>(STORE_DEF, STORES);
      initTable<Tag>(TAG_DEF, TAGS);
      initTable<Event>(EVENT_DEF, EVENTS);
      initTable<EventTag>(EVENT_TAG_DEF, []);
    }));
  });
}

async function initTable<T extends {}>(ref: TableDef, vals: T[]) {
  const dao = Dao.instance(ref);
  for (const val of vals) {
    await dao.insert<T>(val)
      .then(res => console.log(`RETURNED ${ref.name}--- ${JSON.stringify(res)}`))
      .catch(e => console.log(e));
  }
}


const STORES: Store[] = [
  {
    name: 'DCG Lomas',
    wizId: 13642,
    location: '11130 Lomas Blvd NE, Albuquerque, NM, 87112',
    phone: '505-340-9668',
    isPremium: 1
  },
  {
    name: 'DCG High St',
    wizId: 16134,
    location: '600 Central Ave SE, Albuquerque, NM, 87102',
    phone: '505-527-8274',
    isPremium: 1
  },
  {
    name: 'DCG Rio',
    wizId: 14793,
    location: '1700 Southern Blvd SE, Rio Rancho, NM, 87124',
    phone: '505-464-7451',
    isPremium: 1
  },
] as const;

const TAGS: Tag[] = [
  { name: 'Booster Draft', postable: 1 },
  { name: 'Commander' },
  { name: 'Friday Night Magic' },
  { name: 'Sealed Deck', postable: 1 },
  { name: 'Regional Championship Qualifier', postable: 1 },
  { name: 'Magic Prerelease', postable: 1 },
  { name: 'New Player Event' },
  { name: 'Standard' },
  { name: 'Pioneer' },
  { name: 'Modern' },
] as const;

const EVENTS: Event[] = [] as const;
