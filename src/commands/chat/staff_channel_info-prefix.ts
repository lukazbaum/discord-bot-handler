import {  Role, BitField, PermissionsBitField, GuildChannel, GuildMember,  ChannelType, Message, ChannelManager,  EmbedBuilder} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {getCoChannels, getcowners, checkisland, bannedusers, addedusers, getisland } = require('/home/ubuntu/ep_bot/extras/functions');
const { amarikey } = require('/home/ubuntu/ep_bot/extras/settings')
const { AmariBot } = require("amaribot.js");
const amariclient = new AmariBot(amarikey);

export = {
    name: "userinfo",
    aliases: ["Userinfo", "ui", "chaninfo", "Chaninfo"],
    type: CommandTypes.PrefixCommand,
    guildWhitelist: ['1135995107842195550', '801822272113082389'], 
    roleWhitelist:["1148992217202040942","807826290295570432"],
    optionalCategoryWhitelist: ['1140190313915371530',
                        '1147909156196593787',
                        '1147909539413368883',
                        '1147909373180530708',
                        '1137072690264551604',
                        '1147909282201870406',
                        '1147909200924643349',
                        '1147909067172483162',
                        '1140190313915371530',
	                '1203928376205905960',
                        '1232728117936914432',
                        '1192106199404003379',
                        '1192108950049529906',
                        '1225165761920630845',
                        '966458661469839440',
                        '825060923768569907'
			],
    async execute(message: Message): Promise<void> {
    try{
	    if(message.channel.type !== ChannelType.GuildText) return;
	    let stringContent = message.content.toString()
	    function isNumber(value) {
  		return !isNaN(value);
		}
	    let stringContentNoSpace = stringContent.replace(/' '/g,'')
	    let getUsername;

	    if(isNumber(stringContentNoSpace)){
		    getUsername = await message.guild.members.cache.get(stringContentNoSpace);
		    if(!(getUsername)){
			    await message.reply(`${stringContentNoSpace} this userid not a guild member`) 
			    return;
		    }
	    }else if(!stringContent.includes('#') && !stringContent.includes('@')) {
		    await message.reply('please specify either a user or #channelName') 
		    return; 	
	    }
	    let userName = message.mentions.users.first()
	    let channelName = message.mentions.channels.first()
	    let user= '' 
	    let channel = ''
	    let serverId = message.guild.id
	    let channelInfo;

	    if(userName) {
		    user = userName.id
		    channelInfo = await checkisland(user)
		    channel = channelInfo.channel
	    }else if(getUsername.user.username){
		    user = getUsername.id
		    channelInfo = await checkisland(user)
                    channel = channelInfo.channel
	    }else if(channelName){
		    channel = channelName.id
		    channelInfo = await getisland(channel) 
		    user = channelInfo.user
	    }else{
		    message.reply(`something went wrong contact a Dev`)
		    return;
	    }
		    

            const verifiedRoleList: { [key: string]: string } = {
                    '1135995107842195550': '1143236724718317673',
                    '801822272113082389': '807811542057222176',
            };
            const verifiedRoleId = Object.entries(verifiedRoleList).find(([key, val]) => key === serverId)?.[1];

	    const cowner_channels = await getCoChannels(user);
	    let addList = ' '
	    let bannedList =  ' '
	    let roleList = ' '
	    let cowners = ' '
	    let chCownerList = ' '
            let eventsState = ' '
	    let isHidden = ' '
	    let alladds;
	    let allBans;
	    let embed1;
	    let myamari = await amariclient.getUserLevel(message.guild.id, `${user}`)
	    const member = message.guild.members.cache.get(user)
	    let roleMap = member.roles.cache
	    		   .sort((a, b) => b.position - a.position)
			   .map(r => r)

	    let ignoredRoles = ["1143223395350229172",
		    		"1223728995879616573",
	    			"1142826359178149971",
				"1142826974172151929",
	    			"1143223395350229172"]

	    if(roleMap.length > 30) {
		    roleList = "**... too many to list**"
	    }else{ 
	    	for(let i = 0; i < roleMap.length; i++) {
			    if((i + 1)  !== roleMap.length){
				   let item = roleMap[i].id 
				   if(ignoredRoles.some((element) => element === item) === false){ 
				    	roleList = await roleList.concat(`\n> ${i}. ${roleMap[i]}`)
					   }
				   }
			    }
		    	} 
	    if(cowner_channels){
	    	for(let i = 0; i  < cowner_channels.length; i++) {
			    chCownerList = await chCownerList.concat(`\n> ${i+1}. <#${cowner_channels[i].channel}>`)
	    	}
	    }

	    if(channelInfo) {
	    	alladds = await addedusers(channel);
            	allBans = await bannedusers(channel);
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

		if(alladds.length > 30) {
                    addList = "**... too many to list**"
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
	    }

		if(channelInfo) {
	    		 embed1 = new EmbedBuilder()
	   			.setTitle("Staff User Info View")
				.setDescription(`** User Info For: ** <@!${user}>
					         ** User Owns Channel: ** <#${channel}>`)
	 			.addFields({name:"__Channel Users__", value:`${addList}`, inline: true},
					   {name:"__Channel Cowners__", value: `${cowners}`, inline: true},
			  	           {name:"__Channel Banned __", value: `${bannedList}`, inline: true},
			  	   	   {name:"__Channel Events__", value: `${eventsState}`, inline: true},
			  	   	   {name:"__Channel Visibility__", value: `${isHidden}`, inline: true},
			  	   	   {name:"__User ID__", value: `${member.id}`, inline: true},
			  	   	   {name:"__Global Name__", value: `${member.user.globalName}`, inline: true},
					   {name:"__Users Tag__", value: `${member.user.tag}`, inline:true},
					   {name:"__Amari Level__", value: `${myamari.level}`, inline:true},
					   {name:"__Booster Since__", value: `${member.premiumSince}`, inline:true},
			  	   	   {name:"__Date Joined__", value: `${member.joinedAt}`, inline:true},
			  	   	   {name:"__Joined Discord__", value: `${member.user.createdAt}`, inline:true},
			  	   	   {name:"__Assigned Roles__", value: `${roleList}`, inline: true},
					   {name:"__Cowner On Channels__", value:`${chCownerList}`, inline: true}
					)
				.setColor(`#097969`)
	    	} else {
		   	 embed1 = new EmbedBuilder()
                		.setTitle("Staff User Info View")
                		.setDescription(`** User Info For: ** ${userName}`)
				.addFields(
					   {name:"__User ID__", value: `${member.id}`, inline: true},
                                           {name:"__Global Name__", value: `${member.user.globalName}`, inline: true},
                                           {name:"__Users Tag__", value: `${member.user.tag}`, inline:true},
                                           {name:"__Booster Since__", value: `${member.premiumSince}`, inline:true},
					   {name:"__Amari Level__", value: `${myamari.level}`, inline:true},
                                           {name:"__Date Joined__", value: `${member.joinedAt}`, inline:true},
                                           {name:"__Joined Discord__", value: `${member.user.createdAt}`, inline:true},
                                           {name:"__Assigned Roles__", value: `${roleList}`, inline: true},
					   {name:"__Cowner On Channels__", value:`${chCownerList}`, inline: true}
                        		)
				.setColor(`#097969`)
	    	}

	   	await message.reply({embeds:[embed1]})

    }catch(err)
    {console.log(err)}
  }
} as PrefixCommandModule;
