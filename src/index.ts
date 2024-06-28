import config from '../config.json' assert {type: 'json'};
import deploy from './discord/deploy-commands/deploy-commands.js';
import { MyDiscord } from './discord/discord.js';
import { initTables } from './model/db/init.js';
import { scrapeAndSave } from './scrape/scrape.js';

async function main() {

  if (config.actions.discord.login) MyDiscord.instance().login();
  if (config.actions.discord.deploy) deploy();
  if (config.actions.dbInit) await initTables();
  if (config.actions.scrape) await scrapeAndSave();
}

main();
