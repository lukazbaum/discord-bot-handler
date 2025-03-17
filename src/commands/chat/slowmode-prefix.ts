import {ActionRowBuilder,
	ButtonBuilder, 
	ButtonStyle,
	EmbedBuilder,
	ChannelType,
	Message} from "discord.js";
import {PrefixCommand} from "../../handler";
const {getisland, isOwner} = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
    name: "slowmode",
    aliases: ["smon", "Slowmodeon", "slowon"],
	// 1113339391419625572 - Epic Wonderland
	// 1135995107842195550 - Epic Park
	// 839731097473908767 - Blackstone
	allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767'],
	allowedRoles: ['1147864509344661644', '1148992217202040942','807811542057222176',
			'1113407924409221120', //epic wonderland staff
			'1113451646031241316', // epic wonderland users
			'845499229429956628', // Blackstone Staff
			'839731097633423389' // Blackstone Users
			],
	allowedCategories: ["1140190313915371530", "1147909067172483162", "1147909156196593787",
                        '1203928376205905960',
                        '1232728117936914432',
                        '1192106199404003379',
                        '1192108950049529906',
                        '1225165761920630845',
                        '966458661469839440',
												'808109909266006087',
                        '825060923768569907',
		'1113414355669753907',// epic wonderland play land staff
		'1115772256052846632', /// epic wonderland staff
												'1113414451912257536', // epic wonderland booster
												'1115072766878691428', // epic wonderland supreme land
												'1151855336865665024', // epic wonderland supreme land 1
												'1320055421561471048', // epic wonderland supreme land 2
												'1115357822222348319', // epic wonderland Epic Host Land
												'839731102281105409', // Blacstone Knights Hall
												'839731101885923345', // Blackstone wizards tower
												'839731101622075415', // Blacstone Dragon Cave
												'872692223488184350', // Blackstone Nitro Islands
												'1019301054120210482', // Blackstone Donors
												'839731101391781906', // Blackstone Kingdom Elite
												'967657150769942578', // Blackstone Staff
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
                // object is guildId:RoleId
		const modRoleList: { [key: string]: string } = {
			"1135995107842195550": "1148992217202040942", // epic park staff
			'1113339391419625572':'1113407924409221120', // epic wonderland staff
			"839731097473908767": "845499229429956628", // blackstone staff royal guards
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
		if(message.channel.type !== ChannelType.GuildText) return;
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
									       {ManageMessages: true})
		}

		let embed1 = new EmbedBuilder()
			.setTitle("Channel Manager:  Slowmode")
			.setDescription(`Slowmode Enabled. Choose Time 
                                *to disable slowmode, use command slowoff*`)
			.setColor(`#097969`)
		
		 const row: any = new ActionRowBuilder()
        	.addComponents(
			new ButtonBuilder()
                                .setCustomId("2_sec")
                                .setLabel("2 Secs")
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji("🐢"),
                	new ButtonBuilder()
                        	.setCustomId("5_sec")
                        	.setLabel("5 Secs")
                        	.setStyle(ButtonStyle.Secondary)
                        	.setEmoji("🐢"),
                	new ButtonBuilder()
                        	.setCustomId("10_sec")
                        	.setLabel("10 Secs")
                        	.setStyle(ButtonStyle.Secondary)
                        	.setEmoji("🐢"),
			new ButtonBuilder()
                                .setCustomId("30_sec")
                                .setLabel("30 Secs")
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji("🐢"),
			new ButtonBuilder()
                                .setCustomId("45_sec")
                                .setLabel("45 Secs")
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji("🐢")
                	)

   		await message.reply({embeds: [embed1], components: [row]},) 
	}catch(err)
  	{console.log(err)}
    }
});
