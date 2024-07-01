import { MyDiscord } from './discord/discord.js';
import express from 'express';
import { Dao } from './model/db/dao.js';
import { scrapeAndSave } from './scrape/scrape.js';
import { postFromExpress } from './discord/commands/post.js';

async function main() {
  if (process.env.DISCORD_LOGIN) MyDiscord.instance().login();
  await Dao.client.connect();

  const app = express();
  const port = process.env.PORT || 3000;

  app.get('/', (_, res) => {
    res.send('Hello world');
  });

  app.get('/wakeUp', (_, res) => {
    res.send("Ok ok I'm awake");
  });

  app.post('/daily', (_, res) => {
    res.send('Starting Daily');
    doDaily()
      .then(_ => console.log("Daily Succeeded"))
      .catch(e => console.error(e))
  });

  app.get('/swan', (_, res) => {
    try {
      MyDiscord.instance().pingSwan();
      res.send('Success');
    } catch (e) {
      res.send(e)
    }
  });

  app.listen(port, () => {
    console.log(`Express is listening on port ${port}`);
  })
}

async function doDaily(): Promise<void> {
  await scrapeAndSave();
  await postFromExpress();
  await MyDiscord.instance().pingSwan();
}

main();

