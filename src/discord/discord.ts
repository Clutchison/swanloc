import { Client, Collection, GatewayIntentBits } from "discord.js";
import commands from './commands/command.js';
import events from "./events/event.js";
import deploy from "./deploy-commands/deploy-commands.js";

export class MyDiscord {
  public readonly client;
  private static _instance: MyDiscord;

  private constructor() {
    this.client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildScheduledEvents] });
    this.client.commands = new Collection();
    commands.forEach(command => {
      if (!!command.data && !!command.execute) {
        this.client.commands.set(command.data.name, command);
      } else {
        console.log(`[Warning] The command ${command.name} is missing a required "data" or "execute" property.`);
      }
    });

    events.forEach(event => {
      if (!!event.once) this.client.once(event.name, (...args) => event.execute(...args));
      else this.client.on(event.name, (...args) => event.execute(...args));
    });
  }

  public login() {
    deploy();
    this.client.login(process.env.TOKEN);
  }

  public static instance(): MyDiscord {
    if (!MyDiscord._instance) MyDiscord._instance = new MyDiscord();
    return MyDiscord._instance;
  }
}
