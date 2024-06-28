import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { MyCommand } from "./command.js";
import { swanCheck } from "./utility/util.js";
import { scrapeAndSave } from "../../scrape/scrape.js";

const scrape: MyCommand = {
  data: new SlashCommandBuilder()
    .setName('scrape')
    .setDescription('Scrapes Wizard Event Locator and updates db'),
  name: 'Scrape',
  async execute(interaction: CommandInteraction) {
    if (!swanCheck(interaction)) return;
    await interaction.deferReply({ ephemeral: true });
    await scrapeAndSave();
    interaction.editReply({ content: 'Done Scraping!' })
  }
};

export default scrape;
