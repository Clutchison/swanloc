import { CommandInteraction, GuildScheduledEventCreateOptions, SlashCommandBuilder } from "discord.js";
import { MyCommand } from "./command.js";
import { Dao } from "../../model/db/dao.js";
import { Event, EventDao } from "../../model/event.js";
import { Store, STORE_DEF } from "../../model/store.js";
import { swanCheck } from "./utility/util.js";
import { MyDiscord } from "../discord.js";

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
    const storeMap = await getStoreMap();
    const eventsToPost = await EventDao.getEventsToPost();
    console.log(`Found ${eventsToPost.length} to post!`)
    let errOccured = false;
    for (const event of eventsToPost) {
      console.log('Creating event: ' + event.name);

      const store = storeMap[event.storeWizId];
      if (!store) {
        console.error('No store found for event with id: ' + event.id);
        continue;
      }

      const builtEvent = buildEvent(event, store);
      const createdEvent = await interaction.client.guilds.cache.get('1016082585589399623')
        ?.scheduledEvents
        .create(builtEvent);
      if (!!createdEvent) {
        console.log(`Created event: ${JSON.stringify(createdEvent)}`);
        await EventDao.post({ ...event, url: createdEvent.url })
          .catch(err => {
            console.error('Error updating posted status of event with id: ' + event.id + ' - ' + err);
            interaction.editReply(`Oops, something went wrong: ${err}`);
            errOccured = true;
            return;
          });
      }
      console.log('-----Built Event-----');
      console.log(JSON.stringify(builtEvent, null, 4));
    }
    if (!errOccured) interaction.editReply('All done!');
  }
};

export async function postFromExpress(): Promise<void> {
  const storeMap = await getStoreMap();
  const eventsToPost = await EventDao.getEventsToPost();
  console.log(`Found ${eventsToPost.length} to post!`)
  let errOccured = false;
  for (const event of eventsToPost) {
    console.log('Creating event: ' + event.name);

    const store = storeMap[event.storeWizId];
    if (!store) {
      console.error('No store found for event with id: ' + event.id);
      continue;
    }

    const builtEvent = buildEvent(event, store);
    const createdEvent = await MyDiscord.instance().client.guilds.cache.get('1016082585589399623')
      ?.scheduledEvents
      .create(builtEvent);
    if (!!createdEvent) {
      console.log(`Created event: ${JSON.stringify(createdEvent)}`);
      await EventDao.post({ ...event, url: createdEvent.url })
        .catch(err => {
          console.error('Error updating posted status of event with id: ' + event.id + ' - ' + err);
          errOccured = true;
          return;
        });
    }
    console.log('-----Built Event-----');
    console.log(JSON.stringify(builtEvent, null, 4));
  }
}

function buildEvent(event: Event, store: Store): GuildScheduledEventCreateOptions {
  return {
    description: `${store?.name} -- ${formatPrice(event.price)} \n\n ${event.description}`,
    entityMetadata: { location: store?.location || '' },
    entityType: 3,
    name: `${event.name}`,
    privacyLevel: 2,
    scheduledStartTime: Date.parse(event.date),
    scheduledEndTime: Date.parse(event.date) + fourHours
  }
}

async function getStoreMap(): Promise<StoreMap> {
  const stores = await Dao.instance(STORE_DEF).getAll<Store>();
  const storeMap: StoreMap = {};
  stores.forEach(s => storeMap[s.wizId] = s);
  return storeMap
}

export default post;

function formatPrice(price: number): string {
  const dollars: number = Math.floor(price / 100);
  const cents = price % 100;
  const prefix = 'Price: $';
  return cents === 0 ? `${prefix}${dollars}` : `${prefix}${dollars}.${cents}`;
}
