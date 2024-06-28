import { SlashCommandBuilder } from "discord.js";
import ping from './ping.js';
import post from "./post.js";
import scrape from "./scrape.js";
import init from "./init.js";

const commands: MyCommand[] = [
  ping,
  post,
  scrape,
  init,
]

export default commands;

export interface MyCommand {
  name: string;
  data: SlashCommandBuilder,
  once?: boolean;
  execute: (...args: any) => Promise<void> | void;
}
