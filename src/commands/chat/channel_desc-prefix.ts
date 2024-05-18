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
    }

} as PrefixCommandModule;
