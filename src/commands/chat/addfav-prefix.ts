import { Message, MessageMentions } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {checkfav, addfav} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "addfav",
    aliases: ["Addfav"],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966"],
    ownerOnly: true,
    async execute(message: Message): Promise<void> {
	    if (!message.mentions.channels.map(m => m).length) {
		    await message.reply('Did you forget to add the channel?')
		    return;
	    }
	    let channelName = await message.content.replace(/\D/g, '');
	    let user = message.author.id
	    const favoritedChannels = await checkfav(message.author.id);
	    // @ts-ignore
	    const isFavorite = favoritedChannels.some((fav) => fav.channel === channelName)
	    if(isFavorite) {
		    await message.reply('You already have this channel as a favorite')
		    return;
	    } else {
	    	await addfav(user,channelName)
	    	await message.reply(`<#${channelName}> has been added to favorites`)
	    }

    },
} as PrefixCommandModule;
