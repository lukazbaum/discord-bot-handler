import {  Role, BitField, PermissionsBitField, GuildChannel, GuildMember,  ChannelType, Message, ChannelManager,  EmbedBuilder} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {getcowners, bannedusers, addedusers, getisland, isOwner} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "info",
    aliases: ["channelinfo", "chinfo", "Info"],
    type: CommandTypes.PrefixCommand,
    roleWhitelist: ['1147864509344661644', '1148992217202040942', '1246691890183540777'],
    categoryWhitelist: ['1140190313915371530',
	    		'1147909156196593787',
			'1147909539413368883',
			'1147909373180530708',
			'1147909282201870406',
			'1147909200924643349',
			'1147909067172483162',
			'1140190313915371530'],
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
		let channelName = message.mentions.channels.first()
                let channel;
                
		if(channelName) {
                        channel = channelName.id
                }else{
                        channel = message.channel.id
                }

		//handles null values 
		let checkOwner = getOwner && getOwner.some((authorized) => authorized.channel === channel)

                if(!checkOwner){
                        if(!(checkStaff.roles.cache.has('1148992217202040942'))){
				await message.reply('you must be an owner/cowner of this channel to run this command')
                                return;

                	}else if(checkStaff.roles.cache.has('1148992217202040942')){
				console.log("Channel Info Ran In: ", message.channel.id, "by", message.author.id)
			}
		}
	   
	   	// get all channel information 

	    	const alladds = await addedusers(`${channel}`);
	    	const allBans = await bannedusers(`${channel}`);
	    	const channelInfo = await getisland(`${channel}`);
	    	const verifiedRoleId = '1143236724718317673'
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
} as PrefixCommandModule;
