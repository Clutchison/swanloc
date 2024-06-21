import { SlashCommandBuilder } from "discord.js";
import { MyCommand } from "./command.js";
import { MyInteraction } from "./utility/util.js";

const ping: MyCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  name: 'Ping',
  async execute(interaction: MyInteraction) {
    await interaction.reply('Pong!');
  }
};

export default ping;
