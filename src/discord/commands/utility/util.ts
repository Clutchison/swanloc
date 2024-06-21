import { Interaction } from "discord.js";

export type MyInteraction = Interaction & { reply: (s: string) => Promise<void> };
