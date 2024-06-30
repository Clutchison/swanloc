import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { MyCommand } from "./command.js";
import { swanCheck } from "./utility/util.js";
import { dropTables } from "../../model/db/init.js";

const drop: MyCommand = {
  data: new SlashCommandBuilder()
    .setName('drop')
    .setDescription('Drops tables'),
  name: 'Drop',
  async execute(interaction: CommandInteraction) {
    if (!swanCheck(interaction)) return;
    await interaction.deferReply();
    await dropTables();
    await interaction.editReply({ content: 'Tables dropped!' });
  }
};

export default drop;
