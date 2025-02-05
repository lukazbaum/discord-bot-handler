import {  Message, TextChannel, ChannelType, EmbedBuilder}  from "discord.js";
import { PrefixCommand } from '../../handler';
const { updateOwner, getisland,  enableevents, createisland, checkisland} = require('/home/ubuntu/ep_bot/extras/functions');
const emojiRegex = require('emoji-regex');
const { amarikey } = require('../../../../ep_bot/extras/settings')
const { AmariBot } = require("amaribot.js");
const amariclient = new AmariBot(amarikey);

export default new PrefixCommand({
    name: "assign",
    aliases: ["Assign", "ac","assignchannel", "assignch"],
	// 1113339391419625572 - Epic Wonderland
	// 1135995107842195550 - Epic Park
	// 839731097473908767 - Blackstone
	allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767'],
	allowedRoles:["1148992217202040942","807826290295570432", "1073788272452579359",
					"1113407924409221120", // epic wonderland staff
					'845499229429956628', // Blackstone Staff
		],
	optionalAllowedChannels:["1142401741866946702","1147233774938107966", "1138531756878864434",
								"1151411404071518228","1142401741866946702","1158570345100488754",
								"839731098690650117", // backstone assign
								"1024861424549376040", // my personal channel in blackstone
		],
	optionalAllowedCategories:["1137072690264551604","1203928376205905960","1152037896841351258",
								"1113414355669753907", //epic wonderland staff
								"1113414355669753907", // blackstone staff
		],
    async execute(message: Message): Promise<void> {
	 try{
		 if(message.channel.type !== ChannelType.GuildText) return;
	    	let stringContent = message.content.toString()
		 if(!stringContent.includes("#")) {
                    await message.reply('please specify a channel name ex. assign @user # channelname')
               	     return;
		 }
		 let newName = stringContent.split('#')
		 let owner = message.mentions.users.first()
		 if(!owner){
                   await message.reply('please specify a valid @user')
       		           return;
		 }
		 let ownerid = `${owner.id}`
		 let channelCheck = checkisland(owner, message.guild.id)
		 let emojiName;
		 let channelName;
		 let channelWord;
		 let ownerRole = message.guild.roles.cache.get('1147864509344661644')
		 let modRole = '1148992217202040942'
		 let verifiedRole = '1143236724718317673'
		 let memberTarget = message.guild.members.cache.get(owner.id)
		 let boosterRole = "1142141020218347601"
		 let staffRole = "1148992217202040942"
		 let staffParent = "1140190313915371530"
		 let boosterParent = "1147909067172483162"
		 let skaterPark = "1147909200924643349"
		 let parkPavilion = "1147909282201870406"
		 let adventureTrails = "1147909373180530708"
		 let tropicalLounge = "1147909539413368883"
		 let parkPeaks = "1147909156196593787"
		 let myamari;
		 let level;
	     const regex = emojiRegex();
	     let emojiCount = 0
	     let serverId = message.guild.id
	     
		 if(newName[1].includes("<")){
		    await message.reply('You can only use stanard emojis in channel names')
                    return;
            }
            
            const serverCheck = Array.from(checkisland(owner, serverId));

		 if(serverCheck) {
		    //@ts-ignore
		    const isAdded = serverCheck && serverCheck.some((user) => user.server  === serverId)

		    if(isAdded){
                    	let embed = new EmbedBuilder()
                        	.setTitle("Channel Manager: Assign Channel")
                        	.setDescription(`User <@!${channelCheck.user}> already assigned to channel <#${channelCheck.channel}>. Contact dev if you still want to do this`)
                        	await message.reply({embeds: [embed]})
                        	return;
		    }
		 }
	    let progress_bar = await message.channel.send('=>..')

	    for (const match of String(newName).matchAll(regex)) {
	    		  emojiName = match[0]
	     	    	  ++emojiCount 
            	}

		if(emojiCount >= 2) {
		    message.reply("please only use 1 emoji, further name changes can be made with `ep name` \n*required format*: `# <emoji> channel name` or `# channelname`")
		    return;
	    }

		if(emojiName) {
                 channelWord = String(newName).split(`${emojiName}`)[1].trimStart();
                 channelName = channelWord
		}else{
			channelName = String(newName).split(`,`)[1].trimStart()
			channelName = channelName.replace(/>/g, '')
	    }

		let channelExists =  await message.guild.channels.cache.find(channel => channel.id === `${channelName}`)
		 let channelIHAZ = 0

	   if(channelExists){
		   channelIHAZ = 1
	   }
	       

	   await progress_bar.edit('====>...')
	    
	   
	    let channel;
	    if((channelIHAZ === 1) && (message.guild.id ==="1135995107842195550") ) {
		    channel = await message.guild.channels.cache.find(channel => channel.id === `${channelName}`) as TextChannel;
			myamari =  await amariclient.getUserLevel(message.guild.id, ownerid)
			level = parseInt(`${myamari.level}`)
			if(memberTarget.roles.cache.has(staffRole)){
				await channel.setParent(staffParent);
			}else if(memberTarget.roles.cache.has(boosterRole)){
				await channel.setParent(boosterParent);
			}else if((level >= 40) && (level <= 59)){
				await channel.setParent(parkPavilion);
			}else if((level >= 60) && (level <= 79)){
				await channel.setParent(adventureTrails);
			}else if((level >= 80) && (level <= 119)){
				await channel.setParent(tropicalLounge);
			}else if(level >= 120) {
				await channel.setParent(parkPeaks);
			}
		    await progress_bar.edit('========>...')
			await channel.lockPermissions()
			await channel.permissionOverwrites.edit(
				`${owner.id}`,
				{SendMessages:true, ViewChannel:true}
                                                );
			await progress_bar.edit('==========>.')

		    if(await createisland(`${owner.id}`, `${channel.id}`, `${serverId}`) === 'Created!') {
                        let channelOwner = message.guild.members.cache.get(`${owner.id}`)
                        await enableevents(`${channel.id}`)
                        await channelOwner.roles.add(ownerRole)
                     }else{
                        await message.reply("Something happened adding user to the database, contact a dev")
                        return;
                     }

            }else if((channelIHAZ === 0) && (message.guild.id ==="1135995107842195550")){
				myamari =  await amariclient.getUserLevel(message.guild.id, ownerid)
				level = parseInt(`${myamari.level}`)
		    	channel = await message.guild.channels.create({
                         	name: `${channelName}`,
                        	type: ChannelType.GuildText,
                        	parent: "1147909200924643349",
                        })

		    	if(emojiName) {
                 	channelWord = String(newName).split(`${emojiName}`)[1].trimStart();
                 	channelName = " "
                 	channelName = String(channelName).concat(String(emojiName) + '・' + String(channelWord));
                 	await channel.edit({name: channelName})
				} else {
                    	channelWord = String(newName).split(',')[1].trimStart();
                    	channelName = " "
                    	channelName = String(channelName).concat('・' + String(channelWord))
                    	await channel.edit({name: channelName})
            	    }
		    	if(memberTarget.roles.cache.has(staffRole)){
					await channel.setParent(staffParent);
				}else if(memberTarget.roles.cache.has(boosterRole)){
					await channel.setParent(boosterParent);
				}else if((level >= 40) && (level <= 59)){
					await channel.setParent(parkPavilion);
				}else if((level >= 60) && (level <= 79)){
					await channel.setParent(adventureTrails);
				}else if((level >= 80) && (level <= 119)){
					await channel.setParent(tropicalLounge);
				}else if(level >= 120) {
					await channel.setParent(parkPeaks);
				}
				await progress_bar.edit('========>...')
				await channel.lockPermissions()
				await channel.permissionOverwrites.edit(
					`${owner.id}`,
					{SendMessages:true, ViewChannel:true}
                                                );
				await progress_bar.edit('==========>.')

				if(await createisland(`${owner.id}`, `${channel.id}`, `${serverId}`) === 'Created!') {
                	let channelOwner = message.guild.members.cache.get(`${owner.id}`)
                	await enableevents(`${channel.id}`)
                	await channelOwner.roles.add(ownerRole)
		  
				}else{
                        await message.reply("Something happened adding user to the database, contact a dev")
                        return;
            	  }	

		}else if((channelIHAZ === 0) && (message.guild.id === "1113339391419625572")) {
			channel = await message.guild.channels.create({
				name: `${channelName}`,
				type: ChannelType.GuildText,
				parent: "1151855336865665024",
			})
			ownerRole = message.guild.roles.cache.get('1306823581870854174')

			if (emojiName) {
				channelWord = String(newName).split(`${emojiName}`)[1].trimStart();
				channelName = " "
				channelName = String(channelName).concat(String(emojiName) + ' ⸾⸾' + String(channelWord)) + '⸾⸾ ';
				await channel.edit({name: channelName})
			} else {
				channelWord = String(newName).split(',')[1].trimStart();
				channelName = " "
				channelName = String(channelName).concat(' ⸾⸾' + String(channelWord)) + '⸾⸾ '
				await channel.edit({name: channelName})
			}
			await progress_bar.edit('========>...')
			await channel.lockPermissions()
			await channel.permissionOverwrites.edit(
				`${owner.id}`,
				{
					SendMessages: true,
					ViewChannel: true
				}
			);
			await progress_bar.edit('==========>.')

			if (await createisland(`${owner.id}`, `${channel.id}`, `${serverId}`) === 'Created!') {
				let channelOwner = message.guild.members.cache.get(`${owner.id}`)
				await enableevents(`${channel.id}`)
				await channelOwner.roles.add(ownerRole)

			} else {
				await message.reply("Something happened adding user to the database, contact a dev")
				return;
			}
		}else if((channelIHAZ === 1) && (message.guild.id ==="1113339391419625572") ) {
			channel = await message.guild.channels.cache.find(channel => channel.id === `${channelName}`) as TextChannel;
			ownerRole = message.guild.roles.cache.get('1306823581870854174')
			await progress_bar.edit('========>...')
			await channel.lockPermissions()
			await channel.permissionOverwrites.edit(
				`${owner.id}`,
				{
					SendMessages: true,
					ViewChannel: true
				}
			);
			await progress_bar.edit('==========>.')
			if (await createisland(`${owner.id}`, `${channel.id}`, `${serverId}`) === 'Created!') {
				let channelOwner = message.guild.members.cache.get(`${owner.id}`)
				await enableevents(`${channel.id}`)
				await channelOwner.roles.add(ownerRole)
			} else {
				await message.reply("Something happened adding user to the database, contact a dev")
				return;
			}
		}else if((channelIHAZ === 0) && (message.guild.id === "839731097473908767")) {
			channel = await message.guild.channels.create({
				name: `${channelName}`,
				type: ChannelType.GuildText,
				parent: "839731102813913107",
			})
			ownerRole = message.guild.roles.cache.get('892026418937077760')

			if (emojiName) {
				channelWord = String(newName).split(`${emojiName}`)[1].trimStart();
				channelName = " "
				channelName = String(channelName).concat(String(emojiName) + ' ||' + String(channelWord));
				await channel.edit({name: channelName})
			} else {
				channelWord = String(newName).split(',')[1].trimStart();
				channelName = " "
				channelName = String(channelName).concat(' ||' + String(channelWord))
				await channel.edit({name: channelName})
			}
			await progress_bar.edit('========>...')
			await channel.lockPermissions()
			await channel.permissionOverwrites.edit(
				`${owner.id}`,
				{
					SendMessages: true,
					ViewChannel: true
				}
			);
			await progress_bar.edit('==========>.')

			if (await createisland(`${owner.id}`, `${channel.id}`, `${serverId}`) === 'Created!') {
				let channelOwner = message.guild.members.cache.get(`${owner.id}`)
				await enableevents(`${channel.id}`)
				await channelOwner.roles.add(ownerRole)

			} else {
				await message.reply("Something happened adding user to the database, contact a dev")
				return;
			}
		}else if((channelIHAZ === 1) && (message.guild.id ==="839731097473908767") ) {
			channel = await message.guild.channels.cache.find(channel => channel.id === `${channelName}`) as TextChannel;
			ownerRole = message.guild.roles.cache.get('892026418937077760')
			await progress_bar.edit('========>...')
			await channel.lockPermissions()
			await channel.permissionOverwrites.edit(
				`${owner.id}`,
				{
					SendMessages: true,
					ViewChannel: true
				}
			);
			await progress_bar.edit('==========>.')
			if (await createisland(`${owner.id}`, `${channel.id}`, `${serverId}`) === 'Created!') {
				let channelOwner = message.guild.members.cache.get(`${owner.id}`)
				await enableevents(`${channel.id}`)
				await channelOwner.roles.add(ownerRole)
			} else {
				await message.reply("Something happened adding user to the database, contact a dev")
				return;
			}
		}

	    
		let embed1 = new EmbedBuilder()
		.setTitle("Channel Manager: Channel Creation")
		.setDescription(`${owner} is assigned channel: <#${channel.id}>

				channel created by <@!${message.author.id}>`)
 	   let embed2 = new EmbedBuilder()
		 .setTitle("Channel Manager: Channel Creation")
		 .setDescription(`${owner} is assigned channel: <#${channel.id}> \n\n **Channel Manager Command:** ep help\n`)
		 .addFields({name:"**--Channel Created--**", value: new Date().toLocaleString(), inline: true},
			    {name:"**--Channel Created By--**", value: `<@${message.author.id}>`, inline: true},
		 )

		 await message.reply({embeds: [embed1]});
		await channel.send({embeds: [embed2]});

           
	         
	}catch(error)
	    {message.reply('something happened, contact a dev')
		    console.log(error)
	    }

    }
});
