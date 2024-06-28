import { CommandInteraction, Interaction } from "discord.js";
import secrets from '../../../../secret.json' assert {type: 'json'}

export type MyInteraction = Interaction & { reply: (s: string) => Promise<void> };

export async function swanCheck(i: CommandInteraction) {
  if (secrets.swanId !== i.user.id) {
    i.reply({ content: 'Swans only!', ephemeral: true });
    return false;
  } else return true;
}
