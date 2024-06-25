import config from '../config.json' assert {type: 'json'};
import deploy from './discord/deploy-commands/deploy-commands.js';
import { scrape } from './scrape/scrape.js';
import { discord } from './discord/discord.js';
import { initTables } from './model/db/init.js';

if (config.actions.discord.login) discord();
if (config.actions.discord.deploy) deploy();
if (config.actions.scrape) scrape();
if (config.actions.dbInit) initTables();
