import { MyDiscord } from './discord/discord.js';

async function main() {
  if (process.env.DISCORD_LOGIN) MyDiscord.instance().login();
}

main();
