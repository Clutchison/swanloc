import config from '../config.json' assert {type: 'json'};
import deploy from './discord/deploy-commands/deploy-commands.js';
import { scrape } from './scrape/scrape.js';
import { discord } from './discord/discord.js';
import { init } from './model/db/init.js';

discord();
if (config.actions.deploy) deploy();
if (config.actions.scrape) scrape();
if (config.actions.init) init();
