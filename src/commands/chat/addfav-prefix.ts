import { Message, MessageMentions, EmbedBuilder } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {checkfav, addfav} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "addfav",
    aliases: ["Addfav"],
    type: CommandTypes.PrefixCommand,
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1246691890183540777','1143236724718317673'],
    async execute(message: Message): Promise<void> {

	try{
	    let messageContent = message.content
	    let channelName;
	    let digitRegex = new RegExp(/^(?:[+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*)(?:[eE][+-]?\d+)?)$/g)
	    let digitChannel = [...messageContent.matchAll(digitRegex)] 
	    if (messageContent.includes('https')) {
		    let regex = new RegExp(/()\d+$/)
		    channelName = messageContent.match(regex) 
		    console.log("http message: ", channelName)
	    }else if(digitChannel[0]){
		    channelName = digitChannel[0]
		    console.log("digit channel name ", channelName)
	    }else if(message.mentions.channels.map(m => m).length) {
		    channelName = message.mentions.channels.first()
		    console.log("channel mention ", channelName)
	    }
	
	    channelName = String(channelName).replace(/\D/g, '');
	    console.log("Clean Channel Name: ", channelName)

	    let user = message.author.id
	    let channelList = ''
	
	    const favoritedChannels = await checkfav(message.author.id);
	    
	    if(favoritedChannels === false ){
		await addfav(user,channelName)
		channelList = `${channelName}`
		// avoid a race condition
		let NewChannelEmbed1 = new EmbedBuilder()
                	.setTitle("Quick Channel List")
                	.setFooter({text:message.author.tag, iconURL:message.author.displayAvatarURL()})
                	.setTimestamp()
                	.setColor('#097969')
                	.setDescription(`${channelList}`);
		await message.reply({embeds:[NewChannelEmbed1]})
		return;
	    }
	    const isFavorite = favoritedChannels.some((fav) => fav.channel === channelName)
	    if(isFavorite) {
		    await message.reply('You already have this channel as a favorite')
		    return;
	    } else {
	    	await addfav(user,channelName)
		await message.reply(`<#${channelName}> added!`)
	    }


	  }catch(err)
         {console.log(err)}
    },
} as PrefixCommandModule;
