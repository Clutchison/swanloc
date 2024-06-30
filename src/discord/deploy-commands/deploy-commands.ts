import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from 'discord.js';
import commands from '../commands/command.js';

const deploy = () => {
  const builtCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  commands.forEach(command => {
    builtCommands.push(command.data.toJSON());
  });

  const rest = new REST().setToken(process.env.TOKEN || '');

  const run = async () => {
    try {
      console.log(`Started refreshing ${builtCommands.length} application (/) commands.`);

      console.debug(JSON.stringify(builtCommands));

      const data: any = await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID || '', process.env.GUILD_ID || ''),
        { body: builtCommands },
      );

      console.debug(JSON.stringify(data));

      console.log(`Successfully reloaded ${data?.length} application (/) commands.`);
    } catch (error) {
      console.error(error);
    }
  };
  run();
};

export default deploy;
