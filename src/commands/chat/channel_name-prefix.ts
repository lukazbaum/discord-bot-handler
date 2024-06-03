import { EmbedBuilder, 
	Emoji,
	Guild, 
	GuildEmoji, 
	Message, 
	GuildChannel, 
	ChannelType, TextChannel } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const emojiRegex = require('emoji-regex');
const { isOwner } = require('/home/ubuntu/ep_bot/extras/functions')

export = {
    name: "name",
    aliases: [],
    type: CommandTypes.PrefixCommand,
    roleWhitelist: ['1147864509344661644', '1148992217202040942'],
    cooldown: 30,
    async execute(message: Message): Promise<void> {
	try{
		let checkOwner = await isOwner(message.author.id)
                if(checkOwner[0].channel !== message.channel.id) {
                        await message.reply('you must be an owner/cowner of this channel to run this command')
                        return;
                }
	  	if(message.channel.type !== ChannelType.GuildText) return;
	  	let newName;
	  	let stringContent = message.content.toString()
	  	newName = stringContent.split("name")
          	if(stringContent.endsWith("name")) {	  
			await message.reply("Please specify Channel Name")
		  	return;
		  }
	  	const regex = emojiRegex();
	  	let channelWord;
	  	let channelName= ""
	  	let emojiName;

	  	for (const match of String(newName).matchAll(regex)) {
			emojiName = match[0]
	  	}

	  	if(emojiName) {
			channelWord = String(newName).split(`${emojiName}`)[1].trimStart(); 
		 	channelName = String(channelName).concat(String(emojiName) + '・' + String(channelWord));
		 	await message.channel.edit({name: channelName})
	  	}
	  	if(String(newName).trimStart().startsWith("<")) {
			await message.reply("You can only use standard emojis")
			return;
	  	}else {
			channelWord = String(newName).trimStart() 
		  	channelName = String(channelName).concat('・' + channelWord)
		  	await message.channel.edit({name: channelName})
	  	}
	  	let embed = new EmbedBuilder()
                	.setTitle("Channel Name Change")
                	.setDescription(`channel name has been set to ${channelName}

				    *channel names can take up to 10 minutes to appear*`)
                	.setColor('#097969')
	   	await message.reply({embeds:[embed]})
	}catch(err)
  	{console.log(err)}
	  
    }
} as PrefixCommandModule;
