import { Message, MessageMentions } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {checkfav, remfav} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "remfav",
    aliases: ["Remfav", 'remchan'],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966"],
    ownerOnly: true,
    async execute(message: Message): Promise<void> {
	    if (!message.mentions.channels.map(m => m).length) {
		    await message.reply('Did you forget to add the channel?')
		    return;
	    }
	    let channelName = message.content.replace(/\D/g, '')
	    let user = message.author.id
	    const favoritedChannels = await checkfav(message.author.id);
	    // @ts-ignore
	    const isFavorite = favoritedChannels.some((fav) => fav.channel === channelName)
	    if(!isFavorite) {
		    await message.reply('Channel not marked as favorite')
		    return;
	    } else {
	    	await remfav(user, channelName)
	    	await message.reply(`<#${channelName}> has been removed from favorites`)
	    }

    },
} as PrefixCommandModule;
