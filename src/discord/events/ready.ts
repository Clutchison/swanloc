import { Client, Events } from "discord.js";
import { MyEvent } from "./event.js";

const ready: MyEvent = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client<boolean>) {
    console.log(`Ready! Logged in as ${client?.user?.tag || 'No tag found'}`);
  }
};

export default ready;
