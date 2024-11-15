import { ChannelManager, 
	EmbedBuilder, 
	Channel, 
	ChannelType,
	Message, 
	MessageManager, 
	MessageCollector } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {getisland, isOwner} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "slowmodeoff",
    aliases: ["smoff", "Slowmodeoff", "slowoff"],
    type: CommandTypes.PrefixCommand,
	// 1113339391419625572 - Epic Wonderland
	// 801822272113082389 - Epic
	// 1135995107842195550 - Epic Park
	guildWhitelist: ['1135995107842195550', '801822272113082389','1113339391419625572'],
    roleWhitelist: ['1147864509344661644', '1148992217202040942','807811542057222176',
					'1113407924409221120'], // epic wonderland staff
    categoryWhitelist: ["1140190313915371530", "1147909067172483162", "1147909156196593787",
    					'1203928376205905960',
                        '1232728117936914432',
                        '1192106199404003379',
                        '1192108950049529906',
                        '1225165761920630845',
                        '966458661469839440',
	    				'808109909266006087',
                        '825060923768569907',
						'1113414355669753907',// epic wonderland staff
						'1113414451912257536', // epic wonderland booster
						'1115072766878691428', // epic wonderland supreme land
						'1151855336865665024' // epic wonderland supreme land 1
	],
    async execute(message: Message): Promise<void> {
	try{
		if(message.channel.type !== ChannelType.GuildText) return;
                 // This whole Block checks for the channel owner and if not channel owner
                 // if its not the channel owner, checks for the staff role
                 // if user is a staff member, they can run the command
                 // if user is a channel owner or a cowner on the channel / mentioned channel,
                 // then they are authorized.

		let getOwner = await isOwner(message.author.id)
		let checkStaff = await  message.guild.members.cache.get(message.author.id)
		let channel = message.channel.id
		let serverId = message.guild.id


		//handles null values
		let checkOwner = getOwner && getOwner.some((authorized) => authorized.channel === channel)

		const modRoleList: { [key: string]: string } = {
			"1135995107842195550": "1148992217202040942", // epic park
			"801822272113082389": "807826290295570432", // epic
			"1113339391419625572":"1113407924409221120", // epic wonderland staff"
		};

		const roleId = Object.entries(modRoleList).find(([key, val]) => key === serverId)?.[1];

		if(!checkOwner){
			if(!(checkStaff.roles.cache.has(roleId))){
				await message.reply('you must be an owner/cowner of this channel to run this command')
					return;
			}else if(checkStaff.roles.cache.has(roleId)){
				console.log("Clear Ran In: ", message.channel.id, "by", message.author.id)
			}
		}


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
	}catch(err)
  	{console.log(err)}
    }
} as PrefixCommandModule;
