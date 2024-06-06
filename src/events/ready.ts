import Logger from "../handler/util/Logger";
import { Events, ActivityType } from "discord.js";
import { EventModule, UserStatus } from "../handler";
import { DiscordClient } from "../handler/util/DiscordClient";

export = {
    name: Events.ClientReady,
    once: true,
    async execute(client: DiscordClient): Promise<void> {
        if (!client.user) return;

        client.user.setStatus(UserStatus.Online);
        client.user.setActivity("In Development", { type: ActivityType.Watching });
        Logger.log(`Ready! Logged in as ${client.user.tag}`);
    }
} as EventModule;
