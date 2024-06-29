import { MyDiscord } from './discord/discord.js';
import express from 'express';

async function main() {
  if (process.env.DISCORD_LOGIN) MyDiscord.instance().login();
  const app = express();
  const port = process.env.PORT || 3000;

  app.get('/', (req, res) => {
    res.send('Hello world');
  });

  app.listen(port, () => {
    console.log(`Express is listening on port ${port}`);
  })
}

main();
