import { MyDiscord } from './discord/discord.js';
import express from 'express';
import { Dao } from './model/db/dao.js';

async function main() {
  if (process.env.DISCORD_LOGIN) MyDiscord.instance().login();
  await Dao.client.connect();

  const app = express();
  const port = process.env.PORT || 3000;

  app.get('/', (_, res) => {
    res.send('Hello world');
  });

  app.listen(port, () => {
    console.log(`Express is listening on port ${port}`);
  })
}

main();
