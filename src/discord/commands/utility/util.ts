import { CommandInteraction, Interaction } from "discord.js";

export type MyInteraction = Interaction & { reply: (s: string) => Promise<void> };

export async function swanCheck(i: CommandInteraction) {
  if (process.env.SWAN_ID !== i.user.id) {
    i.reply({ content: 'Swans only!', ephemeral: true });
    return false;
  } else return true;
}
