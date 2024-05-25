import { EmbedBuilder, 
	Emoji,
	Guild, 
	GuildEmoji, 
	Message, 
	GuildChannel, 
	ChannelType, TextChannel } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const emojiRegex = require('emoji-regex');

export = {
    name: "name",
    aliases: [],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966"],
    ownerOnly: true,
    cooldown: 30,
    async execute(message: Message): Promise<void> {
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
	   message.reply({embeds:[embed]})
	  
    }
		 

} as PrefixCommandModule;
