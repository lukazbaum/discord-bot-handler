import {  Message, TextChannel, GuildChannelManager, ChannelType, Guild, PermissionsBitField, EmbedBuilder}  from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { getisland,  enableevents, createisland, checkisland} = require('/home/ubuntu/ep_bot/extras/functions');
const emojiRegex = require('emoji-regex');
const { amarikey } = require('../../../../ep_bot/extras/settings')
const { AmariBot } = require("amaribot.js");
const amariclient = new AmariBot(amarikey);


export = {
    name: "assign",
    aliases: ["Assign", "ac","assignchannel", "assignch"],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966", "1138531756878864434", "1151411404071518228","1142401741866946702"],
    roleWhitelist:["1148992217202040942"],
    async execute(message: Message): Promise<void> {
	 try{
            if(message.channel.type !== ChannelType.GuildText) return;
	    let stringContent = message.content.toString()
	    let newName = stringContent.split('#')
	    let channelName = ''
	    let owner = message.mentions.users.first()
	    let ownerid = `${owner.id}`
	    let emojiName;
	    let channelCheck = await checkisland(ownerid)
	    let channelWord;
            let ownerRole = message.guild.roles.cache.get('1147864509344661644')
            let modRole = '1148992217202040942'
            let verifiedRole = '1143236724718317673'
	    let memberTarget = message.guild.members.cache.get(ownerid)
	    let boosterRole = "1142141020218347601"
            let staffRole = "1148992217202040942"
            let staffParent = "1140190313915371530"
            let boosterParent = "1147909067172483162"
            let skaterPark = "1147909200924643349"
            let parkPavilion = "1147909282201870406"
            let adventureTrails = "1147909373180530708"
            let tropicalLounge = "1147909539413368883"
            let parkPeaks = "1147909156196593787"
	    let myamari =  await amariclient.getUserLevel(message.guild.id, ownerid)
	    let level = parseInt(`${myamari.level}`)
	    const regex = emojiRegex();
	     
	    if(!owner){
		    await message.reply('please specify a valid @user')
		    return;
	    }
	    if(stringContent.endsWith(`${owner}`)) {
                    await message.reply('please specifivy a channel name ex. #channelname')
                    return;
            }
	    if(!stringContent.includes("#")) {
		    await message.reply('please specify a channel name ex. #channelname')
		    return;
	    }
	    if(newName[1].includes("<")){
		    await message.reply('You can only use stanard emojis in channel names')
                    return;
            }
	    if(channelCheck) {
                    let embed = new EmbedBuilder()
                        .setTitle("Channel Manager: Assign Channel")
                        .setDescription(`User <@!${channelCheck.user}> already assigned to channel <#${channelCheck.channel}>`)
                        await message.reply({embeds: [embed]})
                        return;
            }
	    for (const match of String(newName).matchAll(regex)) {
                  emojiName = match[0]
          	}
	    if(emojiName) {
                 channelWord = String(newName).split(`${emojiName}`)[1].trimStart();
                 channelName = String(channelName).concat(String(emojiName) + '・' + String(channelWord));
            }else {
                  channelName = String(channelName).concat('・' + newName[1]).trimStart();
	    }

	    await message.guild.channels.create({
		    name: `${channelName}`,
		    type: ChannelType.GuildText,
		    parent: "1147909200924643349", 
	    })
	    var channel = await message.guild.channels.cache.find(channel => channel.name === `${channelName}`) as TextChannel;
	    
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
	    
	    await channel.lockPermissions()
	    await channel.permissionOverwrites.edit( 
	     					`${owner.id}`,
						{SendMessages:true,
						ViewChannel:true}
	    );

	    if(await createisland(`${owner.id}`, `${channel.id}`) === 'Created!') {
		let channelOwner = message.guild.members.cache.get(`${owner.id}`)
		await enableevents(`${channel.id}`)		
		await channelOwner.roles.add(ownerRole)  
	    }else{
		    await message.reply("Something happened, contact a dev")
		    return;
	    }
           let embed1 = new EmbedBuilder()
		.setTitle("Channel Manager: Channel Creation")
		.setDescription(`${owner} is assigned channel: <#${channel.id}>

				channel created by <@!${message.author.id}>`)
	    
           await message.reply({embeds: [embed1]}); 
	         
	}catch(error) {console.log(error)}

    }
} as PrefixCommandModule;
