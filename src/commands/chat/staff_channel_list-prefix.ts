import { GuildChannel, GuildMember, ChannelType, Message, EmbedBuilder} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {getislands} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "channellist",
    aliases: ["Channellist", "cl"],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966", "1138531756878864434", "1151411404071518228"],
    roleWhitelist:["1148992217202040942"],
    categoryWhitelist:["1140190313915371530"],
    async execute(message: Message): Promise<void> {
    try{
	   if(message.channel.type !== ChannelType.GuildText) return;
	   const allChannels = await getislands()  
	   let channelList= 'Epic Park Channel List:'

	   for(let i = 0; i < allChannels.length; i++) {
		   if(`${allChannels[i].user}` !== '1151325182351392818'){
		   channelList = channelList.concat(`\n> ${i+1}. <@!${allChannels[i].user}> owns: <#${allChannels[i].channel}>`)
		   if(channelList.length >= 1900){
			   await message.reply({content: channelList,
  						allowedMentions: { parse: [] }})
			   channelList = 'Epic Park Channel List:'
		   }else if(channelList.length === 23) {
			   return;
		   }
	 	}
	   }
	   await message.channel.send({content: channelList,
				     allowedMentions:{ parse: []}})

    }catch(err)
    {console.log(err)}
}} as PrefixCommandModule;
