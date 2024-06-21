import { SlashCommandBuilder } from "discord.js";
import ping from './ping.js';

const commands: MyCommand[] = [
  ping,
]

export default commands;

export interface MyCommand {
  name: string;
  data: SlashCommandBuilder,
  once?: boolean;
  execute: (...args: any) => Promise<void> | void;
}
