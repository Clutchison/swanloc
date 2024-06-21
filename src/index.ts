import secrets from '../secret.json' assert {type: 'json'};
import config from '../config.json' assert {type: 'json'};
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import events from './discord/events/event.js';
import commands from './discord/commands/command.js';
import deploy from './discord/deploy-commands/deploy-commands.js';

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
  if (!!event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
});

if (config.shouldDeploy) deploy();
else client.login(secrets.token);
