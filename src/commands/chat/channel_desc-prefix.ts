import { EmbedBuilder, Message, GuildChannel, ChannelType, TextChannel } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { isOwner } = require('/home/ubuntu/ep_bot/extras/functions')
export = {
    name: "desc",
    aliases: [],
    type: CommandTypes.PrefixCommand,
    roleWhitelist: ['1147864509344661644', '1148992217202040942'],
    categoryWhitelist: ['1147909067172483162',
	    		'1140190313915371530',
			'1147909156196593787',
			'1147909373180530708',
			'1147909539413368883'],
    async execute(message: Message): Promise<void> {
	try{
		let checkOwner = await isOwner(message.author.id)
                if(checkOwner[0].channel !== message.channel.id) {
                        await message.reply('you must be an owner/cowner of this channel to run this command')
                        return;
                }
	  	if(message.channel.type !== ChannelType.GuildText) return;
	  	let stringContent = message.content.toString()
	  	let newDesc;
	  	newDesc = stringContent.split("desc") 
	  	if(stringContent.endsWith("desc")) {
			  await message.reply("Please specify your channel description")
		  	return;
	  	}
	  	if(Number(String(newDesc).length) > 49 ) {
			  message.reply("channel descriptions cant be longer than 50 characters")
		  	return;
	  	}else{
		 	 await message.channel.setTopic(String(newDesc))
	  	}
	   	let embed = new EmbedBuilder() 
	        	.setTitle("Channel Description")
                    	.setDescription(`Channel Description Updated!
				    New Description: **${newDesc}** 
			
				    *channel descriptions changes can take up to 10 minutes*`)
                    	.setColor('#097969')
	  
           	await message.reply({embeds: [embed]})
     }catch(err)
     {console.log(err)}
    }
} as PrefixCommandModule;
