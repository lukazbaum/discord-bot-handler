import {PermissionsBitField,ChannelType, Message, EmbedBuilder} from "discord.js";
import { PrefixCommand } from '../../handler';
const {getcowners, bannedusers, addedusers, getisland, isOwner} = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
    name: "info",
    aliases: ["channelinfo", "chinfo", "Info", "show"],
	// 1113339391419625572 - Epic Wonderland
	// 1135995107842195550 - Epic Park
	// 839731097473908767 - Blackstone
	// 871269916085452870 - Luminescent

	allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767','871269916085452870'],
	allowedRoles: ['807826290295570432', '1262566008405622879','1147864509344661644', '1148992217202040942',
		'1246691890183540777','1073788272452579359',
		'1113407924409221120', // epic wonderland staff
		'1113451646031241316', // epic wonderland users
		'845499229429956628', // Blackstone Staff
		'839731097633423389', // Blackstone Users
		"1130783135156670504", // Luminescent Users
		'871393325389844521' // Luminescent Leiutenint
			],
	allowedCategories: ['1147909067172483162',
                        '1147909156196593787',
                        '1147909539413368883',
                        '1147909373180530708',
                        '1147909282201870406',
                        '1147909200924643349',
                        '1137072690264551604',
                        '1140190313915371530',
                        '1203928376205905960',
                        '1232728117936914432',
                        '1192106199404003379',
                        '1192108950049529906',
                        '1225165761920630845',
                        '966458661469839440',
	    									'808109909266006087',
                        '825060923768569907',
												'1219009472593399909', // epic park quaratine
												'1113414355669753907',// epic wonderland play land staff
												'1115772256052846632', /// epic wonderland staff
												'1113414451912257536', // epic wonderland booster
												'1115072766878691428', // epic wonderland supreme land
												'1151855336865665024', // epic wonderland supreme land 1
												'1320055421561471048', // epic wonderland supreme land 2
												'1115357822222348319', // epic wonderland Epic Host Land
												'839731102813913107', // Blackstone Squires Corner
												'839731102281105409', // Blackstone Knights Hall
												'839731101885923345', // Blackstone wizards tower
												'839731101622075415', // Blackstone Dragon Cave
												'872692223488184350', // Blackstone Nitro Islands
												'839731101391781906', // Blackstone Kingdom Elite
												'1019301054120210482', // Blackstone Donors
												'967657150769942578', // Blackstone Staff
		'1128607975972548711', // Luminescent Staff

	],
    async execute(message: Message): Promise<void> {
	 try{
		if(message.channel.type !== ChannelType.GuildText) return;
		// This whole Block checks for the channel owner and if not channel owner
		 // if it's not the channel owner, checks for the staff role
		 // if user is a staff member, they can run the command
		 // if user is a channel owner or a cowner on the channel / mentioned channel,
		 // then they are authorized. 

		let getOwner = await isOwner(message.author.id)
                let checkStaff = await  message.guild.members.cache.get(message.author.id)
		let channelName = message.mentions.channels.first()
		let serverId = message.guild.id
                let channel;

                
		if(channelName) {
                        channel = channelName.id
                }else{
                        channel = message.channel.id
                }

		const verifiedRoleList: { [key: string]: string } = {
			'1135995107842195550': '1143236724718317673',
			'1113339391419625572':'1113451646031241316',
			'839731097473908767' : '839731097633423389',
			"871269916085452870": "1130783135156670504", // Luminescent users

		};
		const verifiedRoleId = Object.entries(verifiedRoleList).find(([key, val]) => key === serverId)?.[1];

		
		let checkOwner = getOwner && getOwner.some((authorized) => authorized.channel === channel)
		
		 // object is guildId:RoleId

		 const modRoleIdList: { [key: string]: string } = {
			 "1135995107842195550": "1148992217202040942", // epic park staff
			 '1113339391419625572':'1113407924409221120', // epic wonderland staff
			 "839731097473908767": "845499229429956628", // blackstone staff royal guards
			 "871269916085452870": "871393325389844521", // Luminescent Staff

		 };

		const roleId = Object.entries(modRoleIdList).find(([key, val]) => key === serverId)?.[1];


		if(!checkOwner){
			if(!(checkStaff.roles.cache.has(roleId))){
				await message.reply('you must be an owner/cowner of this channel to run this command')
					return;

			}else if(checkStaff.roles.cache.has(roleId)){
				console.log("Channel Info Ran In: ", message.channel.id, "by", message.author.id)
			}
		}
	   
	   	// get all channel information
		 const alladds = await addedusers(`${channel}`);
		 const allBans = await bannedusers(`${channel}`);
		 const channelInfo = await getisland(`${channel}`);
		 let addList = ' '
		 let bannedList =  ' '
		 let cowners = ' '
		 let eventsState = ' '
		 let isHidden = ' '

		 let cownersList = [channelInfo.cowner1,
					channelInfo.cowner2,
					channelInfo.cowner3,
					channelInfo.cowner4,
					channelInfo.cowner5,
					channelInfo.cowner6,
					channelInfo.cowner7]

		 const filteredOwners: string[] = cownersList.filter((s): s is string => !!(s));

		 for(let i = 0; i < filteredOwners.length; i++) {
			cowners = await cowners.concat(`\n> ${i+1}. <@!${filteredOwners[i]}>`)
		 }
		 if(alladds.length >= 30){
			addList = 'Too Many to List'
		 }else{
	    		for(let i = 0; i < alladds.length; i++) {
				addList = await addList.concat(`\n> ${i+1}. <@!${alladds[i].user}>`)
                	}
		}
		for(let i = 0; i < allBans.length; i++) {
			bannedList = await bannedList.concat(`\n> ${i+1}. <@!${allBans[i].user}>`)
		}

		if(channelInfo.events === 1){
			eventsState = "On"
		}else{
			eventsState = "Off"
		}

		let bitfield = message.channel.permissionsFor(verifiedRoleId).bitfield
		let permArray = new PermissionsBitField(bitfield).toArray()
		
		if((permArray.includes('ViewChannel')) && (permArray.includes('SendMessages'))){
			isHidden = 'Public'
		}else if((permArray.includes('ViewChannel')) && (!permArray.includes('SendMessages'))){
			isHidden = 'Locked'
		}else{
			isHidden = 'Hidden'
		}

		let embed1 = new EmbedBuilder()
	   		.setTitle("Channel Manager: Channel Info")
			.setDescription(`**Channel Owner:** <@!${channelInfo.user}>`)
	 		.addFields({name:"__Added Users__", value:`${addList}`, inline: true},
					{name:"__Current Cowners__", value: `${cowners}`, inline: true},
			  		{name:"__Banned Users__", value: `${bannedList}`, inline: true},
			  		{name:"__Events On or Off?__", value: `${eventsState}`, inline: true},
			  		{name:"__Channel Visibility__", value: `${isHidden}`, inline: true}
			)
			.setColor(`#097969`)
		 await message.reply({embeds:[embed1]})
	}catch(err)
  	{console.log(err)}
    },
});
