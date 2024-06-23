import secrets from '../secret.json' assert {type: 'json'};
import config from '../config.json' assert {type: 'json'};
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import events from './discord/events/event.js';
import commands from './discord/commands/command.js';
import deploy from './discord/deploy-commands/deploy-commands.js';
import { Store } from './model/store.js';
import { Dao } from './db/dao.js';
import { init } from './db/init.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
commands.forEach(command => {
  if (!!command.data && !!command.execute) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[Warning] The command ${command.name} is missing a required "data" or "execute" property.`);
  }
});

events.forEach(event => {
  if (!!event.once) client.once(event.name, (...args) => event.execute(...args));
  else client.on(event.name, (...args) => event.execute(...args));
});

if (config.actions.deploy) deploy();
if (config.actions.login) client.login(secrets.token);

const dao = Dao.get();

dao.db.serialize(() => {
  if (config.actions.init) init(dao);
  const store = new Store('DCG', 1);
  dao.insert(Store.tableDef.name, store.values());
  dao.db.each('SELECT * from STORE', (err, row) => {
    console.log(JSON.stringify(row));
  });
});
