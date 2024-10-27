import { GuildChannel, GuildMember, ChannelType, Message, EmbedBuilder} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {getislands} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "channellist",
    aliases: ["Channellist", "cl"],
    type: CommandTypes.PrefixCommand,
	// 1113339391419625572 - Epic Wonderland
	// 801822272113082389 - Epic
	// 1135995107842195550 - Epic Park
	guildWhitelist: ['1135995107842195550', '801822272113082389','1113339391419625572'],
    roleWhitelist:["1148992217202040942","807826290295570432", "1073788272452579359",
					"1113407924409221120"], // epic wonderland staff
    optionalChannelWhitelist:["1142401741866946702","1147233774938107966", "1138531756878864434",
							"1151411404071518228","1142401741866946702","1158570345100488754"],
    optionalCategoryWhitelist:["1137072690264551604","1203928376205905960","1152037896841351258",
								"1113414355669753907"], // epic wonderland staff
    
    async execute(message: Message): Promise<void> {

    try{
	   if(message.channel.type !== ChannelType.GuildText) return;
	   const allChannels = await getislands()  
	   let channelList= 'Server Channel List:'
	   let serverId = message.guild.id

	   const serverList: { [key: string]: string } = {
                    '1135995107842195550': '1135995107842195550',
                    '801822272113082389':  '801822272113082389',
		   			"1113339391419625572":"1113407924409221120", // epic wonderland staff
            };

	    const serverSelect =  Object.entries(serverList).find(([key, val]) => key  === serverId)?.[1];
	  
	   let n = 0 
	   		
	   for(let i = 0; i < allChannels.length; i++) {
		   if(`${allChannels[i].user}` !== '1151325182351392818'){
		   	if(`${allChannels[i].server}` === serverSelect){
				n++;
		   	channelList = channelList.concat(`\n> ${n}. <@!${allChannels[i].user}> owns: <#${allChannels[i].channel}>`)
		   		if(channelList.length >= 1900){
			   		await message.reply({content: channelList,
  						allowedMentions: { parse: [] }})
			   		channelList = 'Server Channel List:'
		   		}else if(channelList.length === 23) {
			   		return;
		   }
	 	}
	   }
	 }
	   await message.channel.send({content: channelList,
				     allowedMentions:{ parse: []}})

    }catch(err)
    {console.log(err)}
}} as PrefixCommandModule;
