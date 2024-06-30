import { EVENT_DEF } from "../event.js";
import { Store, STORE_DEF } from "../store.js";
import { EVENT_TAG_DEF, POST_ALLOWANCES, Tag, TAG_DEF } from "../tag.js";
import { Dao } from "./dao.js";
import { TableDef } from "./table-def.js";

export async function initTables(): Promise<void> {
  try {

    Dao.createType(POST_ALLOWANCES, 'postallowance');

    await Promise.all([
      Dao.instance(STORE_DEF).createTable(),
      Dao.instance(EVENT_DEF).createTable(),
      Dao.instance(TAG_DEF).createTable(),
      Dao.instance(EVENT_TAG_DEF).createTable(),
    ]);
    await Promise.all([
      // initTable<Store>(STORE_DEF, STORES),
      initTable<Store>(STORE_DEF, TEST_STORES),
      initTable<Tag>(TAG_DEF, TAGS),
    ]);
  } catch (err) {
    console.error(err);
  }
}

export async function dropTables(): Promise<void> {
  await Dao.dropType('postAllowance');
  await Promise.all([
    Dao.instance(STORE_DEF).drop(),
    Dao.instance(EVENT_DEF).drop(),
    Dao.instance(TAG_DEF).drop(),
    Dao.instance(EVENT_TAG_DEF).drop(),
  ])
}

async function initTable<T extends {}>(ref: TableDef, vals: T[]) {
  const dao = Dao.instance(ref);
  for (const val of vals) {
    await dao.insert<T>(val)
      .then(res => console.log(`RETURNED ${ref.name}--- ${JSON.stringify(res)}`))
      .catch(e => console.log(e));
  }
}

const TEST_STORES: Store[] = [
  {
    name: 'DCG Lomas',
    wizId: 13642,
    location: '11130 Lomas Blvd NE, Albuquerque, NM, 87112',
    phone: '505-340-9668',
    isPremium: true
  },
] as const;

const STORES: Store[] = [
  {
    name: 'DCG Lomas',
    wizId: 13642,
    location: '11130 Lomas Blvd NE, Albuquerque, NM, 87112',
    phone: '505-340-9668',
    isPremium: true
  },
  {
    name: 'DCG High St',
    wizId: 16134,
    location: '600 Central Ave SE, Albuquerque, NM, 87102',
    phone: '505-527-8274',
    isPremium: true
  },
  {
    name: 'DCG Rio',
    wizId: 14793,
    location: '1700 Southern Blvd SE, Rio Rancho, NM, 87124',
    phone: '505-464-7451',
    isPremium: true
  },
  {
    name: 'Ettin Games',
    wizId: 10355,
    location: '8510 Montgomery Blvd NE Ste A1 Albuquerque, NM 87111',
    phone: '505-503-6993',
    isPremium: false
  },
  {
    name: 'Old Town Hobbies and Games',
    wizId: 13925,
    location: '112 Rio Grande Blvd NW, Albuquerque, NM, 87104',
    phone: '505-340-5651',
    isPremium: false
  },
  {
    name: 'Tavern of Souls Gaming',
    wizId: 13992,
    location: '10337 Constitution Ave NE Albuquerque, NM 87112',
    phone: '505-361-2703',
    isPremium: false
  },
  {
    name: 'Twin Suns Comic and Games',
    wizId: 9112,
    location: '6301 Riverside Plz NW, Albuquerque, NM, 87120',
    phone: '505-433-9490',
    isPremium: false
  },
  {
    name: 'Inferno\'s House of Cards',
    wizId: 15856,
    location: '1650 Rio Rancho Blvd SE, Rio Rancho, NM, 87124',
    phone: '505-892-3727',
    isPremium: false
  },
  {
    name: 'WZKD Comis & Games',
    wizId: 14644,
    location: '7 Ave Vista Grande, Santa Fe, NM, 87508',
    phone: '617-838-5149',
    isPremium: false
  },
  {
    name: 'Twilight Hobbies and Games',
    wizId: 15823,
    location: '516 N Guadalupe St, Santa Fe, NM, 87501',
    phone: '505-416-1505',
    isPremium: true
  },
] as const;

const TAGS: Tag[] = [
  { name: 'Casual', postAllowance: 'blacklisted' },
  { name: 'Friday Night Magic', postAllowance: 'blacklisted' },
  { name: 'Magic Draft Weekend' },
  { name: 'Magic Prerelease' },
  { name: 'Magic Premier Series', postAllowance: 'whitelisted' },
  { name: 'Magic Premier Series Preliminary', postAllowance: 'whitelisted' },
  { name: 'MagicFest', postAllowance: 'whitelisted' },
  { name: 'Commander Nights', postAllowance: "blacklisted" },
  { name: 'Launch Weekend', postAllowance: 'whitelisted' },
  { name: 'Store Championship', postAllowance: 'whitelisted' },
  { name: 'Game Day', postAllowance: 'whitelisted' },
  { name: 'World Championship', postAllowance: 'whitelisted' },
  { name: 'Pro Tour', postAllowance: 'whitelisted' },
  { name: 'Regional Championship', postAllowance: 'whitelisted' },
  { name: 'Regional Championship Qualifier', postAllowance: 'whitelisted' },
  { name: 'Booster Draft' },
  { name: 'Sealed Deck' },
  { name: 'New Player Event', postAllowance: 'blacklisted' },
  { name: 'Standard' },
  { name: 'Pioneer' },
  { name: 'Modern' },
  { name: 'Commander' },
] as const;
