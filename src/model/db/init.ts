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
  {
    name: 'Ettin Games',
    wizId: 10355,
    location: '8510 Montgomery Blvd NE Ste A1 Albuquerque, NM 87111',
    phone: '505-503-6993',
    isPremium: 0
  },
  {
    name: 'Old Town Hobbies and Games',
    wizId: 13925,
    location: '112 Rio Grande Blvd NW, Albuquerque, NM, 87104',
    phone: '505-340-5651',
    isPremium: 0
  },
  {
    name: 'Tavern of Souls Gaming',
    wizId: 13992,
    location: '10337 Constitution Ave NE Albuquerque, NM 87112',
    phone: '505-361-2703',
    isPremium: 0
  },
  {
    name: 'Twin Suns Comic and Games',
    wizId: 9112,
    location: '6301 Riverside Plz NW, Albuquerque, NM, 87120',
    phone: '505-433-9490',
    isPremium: 0
  },
  {
    name: 'Inferno\'s House of Cards',
    wizId: 15856,
    location: '1650 Rio Rancho Blvd SE, Rio Rancho, NM, 87124',
    phone: '505-892-3727',
    isPremium: 0
  },
  {
    name: 'WZKD Comis & Games',
    wizId: 14644,
    location: '7 Ave Vista Grande, Santa Fe, NM, 87508',
    phone: '617-838-5149',
    isPremium: 0
  },
  {
    name: 'Twilight Hobbies and Games',
    wizId: 15823,
    location: '516 N Guadalupe St, Santa Fe, NM, 87501',
    phone: '505-416-1505',
    isPremium: 1
  },
] as const;

const TAGS: Tag[] = [
  { name: 'Casual' },
  { name: 'Friday Night Magic' },
  { name: 'Magic Draft Weekend' },
  { name: 'Magic Prerelease' },
  { name: 'Magic Premier Series', postable: 1 },
  { name: 'Magic Premier Series Preliminary', postable: 1 },
  { name: 'MagicFest', postable: 1 },
  { name: 'Commander Nights' },
  { name: 'Launch Weekend', postable: 1 },
  { name: 'Store Championship', postable: 1 },
  { name: 'Game Day', postable: 1 },
  { name: 'World Championship', postable: 1 },
  { name: 'Pro Tour', postable: 1 },
  { name: 'Regional Championship', postable: 1 },
  { name: 'Regional Championship Qualifier', postable: 1 },
  { name: 'Booster Draft' },
  { name: 'Sealed Deck' },
  { name: 'New Player Event' },
  { name: 'Standard' },
  { name: 'Pioneer' },
  { name: 'Modern' },
  { name: 'Commander' },
] as const;

const EVENTS: Event[] = [] as const;
