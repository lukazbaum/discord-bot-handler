import { Message, MessageMentions } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {checkfav, remfav} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "remfav",
    aliases: ["Remfav", 'remchan'],
    type: CommandTypes.PrefixCommand,
	// 1113339391419625572 - Epic Wonderland
	// 1135995107842195550 - Epic Park
	// 839731097473908767 - Blackstone
	guildWhitelist: ['1135995107842195550','1113339391419625572', '839731097473908767'],
    	roleWhitelist: ['1143236724718317673','1147864509344661644', '1148992217202040942','1143236724718317673',
					'807811542057222176',
					'1113407924409221120', // epic wonderland staff
					'1113451646031241316', // epic wonderland users
					'845499229429956628', // Blackstone Staff
					'839731097633423389' // Blackstone Users
				],
    async execute(message: Message): Promise<void> {
	try{
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
	}catch(err)
  	{console.log(err)}

    },
} as PrefixCommandModule;
