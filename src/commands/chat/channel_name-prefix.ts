import { EmbedBuilder, 
	Emoji,
	Guild, 
	GuildEmoji, 
	Message, 
	GuildChannel, 
	ChannelType, TextChannel } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { isOwner } = require('/home/ubuntu/ep_bot/extras/functions')

export = {
    name: "name",
    aliases: [],
    type: CommandTypes.PrefixCommand,
    optionalRoleWhitelist: ['1147864509344661644', '1148992217202040942'],
    categoryWhitelist:[	'1147909067172483162',
                        '1147909156196593787',
                        '1147909539413368883',
                        '1147909373180530708',
                        '1147909282201870406',
                        '1147909200924643349',
                        '1140190313915371530'],
    cooldown: 30,
    async execute(message: Message): Promise<void> {
	try{
		let checkOwner = await isOwner(message.author.id)
                let checkStaff = await  message.guild.members.cache.get(message.author.id)

                if(checkOwner[0].channel !== message.channel.id ){
                        if(checkStaff.roles.cache.has('1148992217202040942')){
                                // continue
                        }else{
                                await message.reply('you must be an owner/cowner of this channel to run this command')
                                         return;
                        }
                }
	  	if(message.channel.type !== ChannelType.GuildText) return;
	  	let newName;
	  	let stringContent = message.content.toString()
	  	newName = stringContent.split("name")
          	if(stringContent.endsWith("name")) {	  
			await message.reply("Please specify Channel Name")
		  	return;
		  }
	  	let channelWord;
	  	let channelName = ""

	  	if(String(newName).trimStart().startsWith("<")) {
			await message.reply("You can only use standard emojis")
			return;
		}
		channelWord = String(newName).trimStart() 
		channelName = channelName.concat('・' + channelWord)
		await message.channel.edit({name: channelName})
	  	
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
