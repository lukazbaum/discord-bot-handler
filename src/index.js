import 'dotenv/config';
import { AutomaticIntents, ExtendedClient, Features } from './handler';
export const client = new ExtendedClient({
    intents: AutomaticIntents,
    features: [Features.All],
    disabledFeatures: [Features.SlashCommands],
    uploadCommands: false,
});
(async () => {
    await client.login(process.env.CLIENT_TOKEN);
})();
