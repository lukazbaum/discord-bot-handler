import { Message } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { getisland,  disableevents } = require("/home/ubuntu/ep_bot/extras/functions");

export = {
    name: "noevents",
    aliases: ["disableevents", "de", "disableevent"],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966"],
    ownerOnly: true,
    async execute(message: Message): Promise<void> {
        let is = await getisland(message.channel.id)
        if(!is){ 
		await message.reply("This channel isn't assigned to a user.")
	}else{
	       	await disableevents(message.channel.id)
        	await message.reply("Epic RPG and Idle Alerts Are Disabled use `pm events` to re-enable.")
	}
    }
    
} as PrefixCommandModule;
