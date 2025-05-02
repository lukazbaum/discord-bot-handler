import { Message, EmbedBuilder } from "discord.js";
import { PrefixCommand } from '../../handler';
const {checkfav, favChannels} = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
    name: "favs",
    aliases: ["chanfav", "ch", "chfav", "fav"],
	// 1113339391419625572 - Epic Wonderland
	// 1135995107842195550 - Epic Park
	// 839731097473908767 - Blackstone
	// 871269916085452870 - Luminescent
	allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767','871269916085452870'],
	allowedRoles: ['1147864509344661644', '1148992217202040942','1147864509344661644','807811542057222176',
		'1113407924409221120', // epic wonderland staff
		'1113451646031241316', // epic wonderland users
		'845499229429956628', // Blackstone Staff
		'839731097633423389', // Blackstone Users
		"1130783135156670504", // Luminescent Users
		'871393325389844521' // Luminescent Leiutenint
	],
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
});
