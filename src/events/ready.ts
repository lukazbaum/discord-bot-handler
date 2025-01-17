<<<<<<< HEAD
import Logger from "../handler/util/Logger";
import { Events, ActivityType, ClientPresence } from "discord.js";
import { EventModule, UserStatus } from "../handler";
import { DiscordClient } from "../handler/util/DiscordClient";

export = {
    name: Events.ClientReady,
    once: true,
    async execute(client: DiscordClient): Promise<void> {
        if (!client.user) return;

        client.user.setStatus(UserStatus.Online);
        client.user.setActivity("ep help // Channel Manager", { type: ActivityType.Custom});
        Logger.log(`Ready! Logged in as ${client.user.tag}`);
    }
} as EventModule;
=======
import { Event, ExtendedClient } from '../handler';
import { ActivityType, Events, PresenceUpdateStatus } from 'discord.js';

export default new Event({
  name: Events.ClientReady,
  once: true,
  async execute(client: ExtendedClient): Promise<void> {
    client.user?.setStatus(PresenceUpdateStatus.Online);
    client.user?.setActivity('Development', { type: ActivityType.Watching });
  },
});
>>>>>>> 1ba7b721051224c5ba87ccd88f479c8eccdc8e84
