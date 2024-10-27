import { Message, EmbedBuilder } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {checkfav, favChannels} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "favs",
    aliases: ["chanfav", "ch", "chfav", "fav"],
    type: CommandTypes.PrefixCommand,
	// 1113339391419625572 - Epic Wonderland
	// 801822272113082389 - Epic
	// 1135995107842195550 - Epic Park
	guildWhitelist: ['1135995107842195550', '801822272113082389','1113339391419625572'],
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1147864509344661644','807811542057222176',
					'1113407924409221120'], // epic wonderland staff
    async execute(message: Message): Promise<void> {
	try{
	    const channelFavs = await checkfav(message.author.id)
	    if (!channelFavs.length) {
		let embed1 = new EmbedBuilder()
                .setFooter({text:message.author.tag, iconURL:message.author.displayAvatarURL()})
		.setTimestamp()
		.setColor('#097969')
                .setFields({name: "Want to add a channel to this list?", value:"Type `ep addfav`"})
		.setDescription(`Channel List\n\nYou do not have any favorite channel.`)
        		await message.reply({embeds:[embed1]})
		    	return;
	    }
	    let channelList = " "
	    for (let i = 0; i < channelFavs.length; i++) {
		channelList = await channelList.concat(`\n ${i+1} <#${channelFavs[i].channel}>`)
	    }
				
	    let embed2 =  new EmbedBuilder()
		    .setTitle("Quick Channel List")
		    .setFooter({text:message.author.tag, iconURL:message.author.displayAvatarURL()})
                    .setTimestamp()
                    .setColor('#097969')
		    .setDescription(`${channelList}`);
	   await message.reply({embeds:[embed2]})
	}catch(err)
  	{console.log(err)}
    }
} as PrefixCommandModule;
