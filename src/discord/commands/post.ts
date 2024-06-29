import { CommandInteraction, GuildScheduledEventCreateOptions, SlashCommandBuilder } from "discord.js";
import { MyCommand } from "./command.js";
import { Dao } from "../../model/db/dao.js";
import { Event, EventDao } from "../../model/event.js";
import { Store, STORE_DEF } from "../../model/store.js";
import { EventTag, Tag, TAG_DEF } from "../../model/tag.js";
import { swanCheck } from "./utility/util.js";

const fourHours = 14400000 as const;
type StoreMap = { [key in number]: Store };

const post: MyCommand = {
  data: new SlashCommandBuilder()
    .setName('post')
    .setDescription('Post New Events from Wizards Event Locator'),
  name: 'post',
  async execute(interaction: CommandInteraction) {
    if (!swanCheck(interaction)) return;
    await interaction.reply({ content: 'Creating Events...', ephemeral: true })
    const stores = await Dao.instance(STORE_DEF).getAll<Store>();
    const storeMap: StoreMap = {};
    stores.forEach(s => storeMap[s.wizId] = s);
    const eventsToPost = await getEventsToPost(storeMap);
    console.log(`Found ${eventsToPost.length} to post!`)
    let errOccured = false;
    for (const event of eventsToPost) {
      console.log('Creating event: ' + event.name);
      const store = storeMap[event.storeWizId];
      const etc: GuildScheduledEventCreateOptions = {
        description: `${store?.name} -- ${formatPrice(event.price)} \n\n ${event.description}`,
        entityMetadata: { location: store?.location || '' },
        entityType: 3,
        name: `${event.name}`,
        privacyLevel: 2,
        scheduledStartTime: Date.parse(event.date),
        scheduledEndTime: Date.parse(event.date) + fourHours
      }
      const createdEvent = await interaction.client.guilds.cache.get('1016082585589399623')?.scheduledEvents.create(etc)
      if (!!createdEvent) {
        console.log(createdEvent.url);
        await EventDao.post({ ...event, url: createdEvent.url })
          .catch(err => {
            console.error('Error updating posted status of event with id: ' + event.id + ' - ' + err);
            interaction.editReply(`Oops, something went wrong: ${err}`);
            errOccured = true;
            return;
          });
      }
    }
    interaction.editReply('All done!');
  }
};

export default post;

async function getEventsToPost(storeMap: StoreMap): Promise<Event[]> {
  return new Promise((resolve, reject) => {
    Dao.db.all(`SELECT * from EVENT WHERE isPosted = 0`, function(err: Error, allEvents: Event[]) {
      if (!!err) reject(err);
      else {
        filterEventsByTag(allEvents, storeMap).then(filteredEvents => {
          resolve(filteredEvents.filter(e => isWithinTwoWeeks(e.date)))
        }).catch(reject);
      }
    });
  });
}

async function filterEventsByTag(allEvents: Event[], storeMap: StoreMap): Promise<Event[]> {
  const tags = await Dao.instance(TAG_DEF).getAll<Tag>();
  const tagMap: { [key in number]: Tag } = {};
  const fnm = tags.find(t => t.name === 'Friday Night Magic');
  tags.forEach(t => tagMap[t.id || 0] = t)
  const filteredEvents = new Set<Event>();
  for (const event of allEvents) {
    const store = storeMap[event.storeWizId || 0];
    const ets = await getAllETsforEvent(event);
    const foundTags = ets.map(et => tagMap[et.tagId]);
    console.log(`Found tags: ` + JSON.stringify(foundTags));
    const isDCGPrerelease = store?.name?.toLowerCase()?.includes('dcg lomas') &&
      foundTags.filter(t => t?.name?.toLowerCase()?.includes('prerelease'))

    if ((foundTags.filter(t => t?.postable).length > 0 || isDCGPrerelease)
      && !foundTags.includes(fnm)) {
      console.log('Adding event: ' + JSON.stringify(event));
      filteredEvents.add(event);
    }
  }
  return [...filteredEvents];
}

async function getAllETsforEvent(event: Event): Promise<EventTag[]> {
  return new Promise((resolve, reject) => {
    Dao.db.all('SELECT * from EVENT_TAG WHERE eventId=?', [event.id], function(err: Error, res: EventTag[]) {
      if (!!err) reject(err);
      else resolve(res)
    });
  });
}

function formatPrice(price: number): string {
  const dollars: number = Math.floor(price / 100);
  const cents = price % 100;
  const prefix = 'Price: $';
  return cents === 0 ? `${prefix}${dollars}` : `${prefix}${dollars}.${cents}`;
}

function isWithinTwoWeeks(date: string) {
  const d = Date.parse(date);
  const future = twoWeeksFromNow();
  return d <= future;
}

function twoWeeksFromNow(): number {
  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
  return twoWeeksFromNow.getTime();
}
