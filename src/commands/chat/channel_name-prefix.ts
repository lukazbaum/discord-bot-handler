import { EmbedBuilder, 
	Emoji,
	Guild, 
	GuildEmoji, 
	Message, 
	GuildChannel, 
	ChannelType, TextChannel } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";

export = {
    name: "name",
    aliases: [],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966"],
    ownerOnly: true,
    disabled: false, 
    async execute(message: Message): Promise<void> {
	  if(message.channel.type !== ChannelType.GuildText) return;
	  let newName = ""
	  let stringContent = message.content.toString(),
		  word = "name",
		  substring = '';
    	  if(stringContent.indexOf(word)  -1) {
		  newName = stringContent.substr(stringContent.indexOf(word) + word.length);
	  }

	  if(Number(newName.length) < 1){
		  message.reply("Please specify the name")
		  return;
		  }
	  const regex = new RegExp(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu)
          //const regex = new RegExp(/\p{Emoji}/gu)
	  let emojiName = regex.exec(newName)
	  let channelWord = " "
	  let channelName = " "
	  if(emojiName !== null) {
		 channelWord = newName.substring(newName.lastIndexOf(' ') + 1); 
		 channelName = channelName.concat(emojiName + ' ' + '・' + channelWord)
		 message.channel.edit({name: channelName})
	  }else {
		  channelWord = newName.substring(newName.lastIndexOf(' ') + 1);
		  channelName = channelName.concat('・' + channelWord)
		  message.channel.edit({name: channelName})
	  }
	  let embed = new EmbedBuilder()
                    .setTitle("Channel Name Change")
                    .setDescription(`channel name has been set

				    *channel names can be changed every 10 minutes only*`)
                    .setColor('#097969')
	   message.reply({embeds:[embed]})
	  
    }
		 

} as PrefixCommandModule;
