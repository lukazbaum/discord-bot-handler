import { ChannelManager, 
	EmbedBuilder, 
	Channel, 
	ChannelType,
	Message, 
	MessageManager, 
	MessageCollector } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {getisland} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "slowmodeoff",
    aliases: ["smoff", "Slowmodeoff", "slowoff"],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966"],
    ownerOnly: true,
    async execute(message: Message): Promise<void> {
	if(message.channel.type !== ChannelType.GuildText) return;
     	if(message.channel.rateLimitPerUser) {
                message.channel.setRateLimitPerUser(0)
                let island = await getisland(message.channel.id)
		let users = [island.user,
				island.cowner1,
				island.cowner2,
				island.cowner3,
				island.cowner4,
				island.cowner5,
				island.cowner6,
				island.cowner7]
            	for(let i = 0; i < 7; i++) {
                	if(users[i]) message.channel.permissionOverwrites.edit(users[i], 
									       {ManageMessages: false})
		}
	}
		let embed1 = new EmbedBuilder()
			.setTitle("Channel Manager:  Slowmode ")
                	.setDescription(`Slowmode Has Been Disabled
                                *to re-enable slowmode, use command ep slowmode*`)
                	.setColor(`#097969`)

   		await message.reply({embeds: [embed1]}) 
    }
    
} as PrefixCommandModule;
