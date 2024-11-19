import { Message } from "discord.js";
import { CommandTypes, PingCommandModule } from "../../handler";

export = {
    name: "jordi",
    guildWhitelist: ['1135995107842195550', ],
    type: CommandTypes.PingCommand,
    async execute(message: Message): Promise<void> {
        await message.reply("Dont Bother Me");
    }
} as PingCommandModule;
