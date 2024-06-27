import config from '../config.json' assert {type: 'json'};
import deploy from './discord/deploy-commands/deploy-commands.js';
import { discord } from './discord/discord.js';
import { initTables } from './model/db/init.js';
import { scrape, scrapeAndSave } from './scrape/scrape.js';

if (config.actions.discord.login) discord();
if (config.actions.discord.deploy) deploy();
if (config.actions.dbInit) await initTables();
if (config.actions.scrape) await scrapeAndSave();
