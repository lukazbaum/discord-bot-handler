import { glob } from "glob";
import Logger from "./Logger";
import { eventsFolderName } from "../../config";
import { DiscordClient } from "./DiscordClient";
import { EventModule } from "../types/EventModule";

export async function registerEvents(client: DiscordClient): Promise<void> {
    const eventsPaths: string[] = await glob(`**/${eventsFolderName}/**/**/*.js`);

    for (const eventPath of eventsPaths) {
        const importPath: string = `../..${eventPath.replace(/^dist[\\\/]|\\/g, "/")}`;
        try {
            const eventModule: EventModule = (await import(importPath)).default;
            const { name, execute, once } = eventModule;

            client.events.push(name);
            if (once) {
                client.once(String(name), (...args: any[]) => execute(...args));
            } else {
                client.on(String(name), (...args: any[]) => execute(...args));
            }
        } catch (err) {
            Logger.error(`Failed to load event at: ${importPath}`, err);
        }
    }
}
