import { Message, EmbedBuilder } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {checkfav, favChannels} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "home",
    aliases: ["takemehome", "tohome", "phonehome", "ethome"],
    type: CommandTypes.PrefixCommand,
    guildWhitelist: ['1135995107842195550', ],
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1147864509344661644','807811542057222176'],
    async execute(message: Message): Promise<void> {
	try{
	
	}catch(err)
  	{console.log(err)}
    }
} as PrefixCommandModule;
