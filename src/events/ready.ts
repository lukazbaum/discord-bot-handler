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
