import { Dao } from "./db/dao.js";
import { TableDef } from "./db/table-def.js";
import { Tag } from "./tag.js";

export type Event = {
  readonly id?: number | null;
  readonly name: string;
  readonly storeWizId: number;
  readonly price: number;
  readonly date: string;
  readonly description: string;
  readonly isPosted?: boolean;
  readonly url?: string;
}

export type EventWithTags = Event & {
  tags: Tag[]
};

export const EVENT_DEF: TableDef = {
  columns: [
    {
      name: 'id',
      type: 'serial',
      primary: true,
    },
    {
      name: 'name',
      type: 'varchar',
    },
    {
      name: 'storeWizId',
      type: 'integer',
    },
    {
      name: 'price',
      type: 'integer',
    },
    {
      name: 'date',
      type: 'timestamp',
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'isPosted',
      type: 'boolean',
      default: false,
    },
    {
      name: 'url',
      type: 'varchar',
    },
  ],
  name: 'EVENT',
  multiUnique: [
    'name',
    'storeWizId',
    'date'
  ]
} as const;

export class EventDao {
  static async post(e: Event) {
    if (!!e.id && !!e.url) {
      const s = `UPDATE EVENT SET url=$1, "isPosted"=true WHERE id=$2`;
      Dao.query(s, '[UPDATE]', e.url, e.id);
    }
  }

  static async populateEventTags(event: Event): Promise<EventWithTags> {
    const etRes = await Dao.query(
      'SELECT ta.* ' +
      'from event e ' +
      'inner join event_tag et on e.id = et."eventId" ' +
      'inner join tag ta on ta.id = et."tagId" ' +
      'where e.id = $1 ',
      '[GET EVENT_TAGS]',
      event.id
    );
    return {
      ...event,
      tags: etRes.rows as Tag[]
    }
  }

  static async getEventsToPost() {
    const eventRes = await Dao.query(
      `SELECT * FROM EVENT WHERE date BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '14' DAY AND "isPosted" = false`,
      '[GET EVENTS TO POST]'
    );
    const eventsToPost: Set<Event> = new Set();
    for (const event of eventRes.rows as Event[]) {
      const ewt = await EventDao.populateEventTags(event);
      const allowances = new Set(ewt.tags.map(t => t.postAllowance));
      if (allowances.has('whitelisted') && !allowances.has('blacklisted'))
        eventsToPost.add(ewt);
    }
    const dcgPrereleases = await EventDao.getDcgPrereleases();
    dcgPrereleases.forEach(eventsToPost.add);
    return [...eventsToPost];
  }

  static async getDcgPrereleases(): Promise<Event[]> {
    const dcgId = 136421;
    const res = await Dao.query(
      `SELECT * FROM EVENT WHERE "storeWizId"=$1 and date BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '14' DAY AND "isPosted" = false`,
      '[GET DCG PRERELEASES]',
      dcgId
    )
    return res.rows;
  }
}

