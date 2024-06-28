import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { MyCommand } from "./command.js";
import { swanCheck } from "./utility/util.js";
import { initTables } from "../../model/db/init.js";

const init: MyCommand = {
  data: new SlashCommandBuilder()
    .setName('init')
    .setDescription('Initializes the db'),
  name: 'DB Init',
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    if (!(await swanCheck(interaction))) return;
    initTables().then(_ => {
      interaction.editReply({ content: 'Tables Initialized' })
    }).catch(err => {
      interaction.editReply({ content: 'Error: ' + err })
    });
  }
};

export default init;
