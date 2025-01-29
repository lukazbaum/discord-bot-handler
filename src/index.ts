import 'dotenv/config';
import { AutomaticIntents, ExtendedClient, Features } from './handler';

export const client: ExtendedClient = new ExtendedClient({
    // "AutomaticIntents" will provide your client with all necessary Intents.
    // By default, two specific Intents are enabled (Guilds, & MessageContent).
    // For details or modifications, see the config.ts file.
    // Manually adding Intents also works.
    intents: AutomaticIntents,

    // "features" allows you to enable specific functionalities for your bot.
    // Use "Features.All" to enable all features (Events, Commands, Components, etc.).
    // Alternatively, you can enable only selected features like:
    // features: [Features.SlashCommands, Features.Buttons]
    features: [Features.All],

    // "disabledFeatures" lets you explicitly disable specific features, even if "Features.All" is used above.
    // For example, to disable Prefix Commands:
    // disabledFeatures: [Features.PrefixCommands]
    // By default, no features are disabled (empty array).
    disabledFeatures: [Features.SlashCommands],

    // Whether to deploy your Slash Commands to the Discord API (refreshes command.data)
    // Not needed when just updating the execute function.
    // Keep in mind that guild commands will be deployed instantly
    // and global commands can take up to one hour.
    uploadCommands: false,
});

(async (): Promise<void> => {
    await client.login(process.env.CLIENT_TOKEN);
    // You can delete commands like this:
    // await client.deleteCommand(RegisterType, 'command_id_here');
    // await client.deleteCommands(RegisterType, ['command_id_1', 'command_id_2']);
})();