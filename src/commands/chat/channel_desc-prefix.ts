import { EmbedBuilder, Message, GuildChannel, ChannelType, TextChannel } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";

export = {
    name: "desc",
    aliases: [],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966"],
    ownerOnly: true,
    disabled: false, 
    async execute(message: Message): Promise<void> {
	  if(message.channel.type !== ChannelType.GuildText) return;
	  let newDesc = ""
	  let stringContent = message.content.toString(),
		  word = "desc",
		  substring = '';
    	  if(stringContent.indexOf(word)  -1) {
		  newDesc = stringContent.substr(stringContent.indexOf(word) + word.length);
	  }

	  if(Number(newDesc.length) < 1){
		  message.reply("Please specify the description")
		  return;
		  }
	   message.channel.setTopic(newDesc)
	   let embed = new EmbedBuilder() 
	            .setTitle("Channel Description")
                    .setDescription(`Channel Description Updated!
				    
				    *channel descriptions can be changed every 10 minutes*`)
                    .setColor('#097969')
	  
           await message.reply({embeds: [embed]})
    }

} as PrefixCommandModule;
