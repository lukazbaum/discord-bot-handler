import {  Role, BitField, PermissionsBitField, GuildChannel, GuildMember,  ChannelType, Message, ChannelManager,  EmbedBuilder} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {getCoChannels, getcowners, checkisland, bannedusers, addedusers, getisland } = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "boostercheck",
    aliases: ["bc", "boosts"],
    type: CommandTypes.PrefixCommand,
    roleWhitelist:["1148992217202040942"],
    CategoryWhitelist: ["1137072690264551604","1140190313915371530"],
    async execute(message: Message): Promise<void> {
    try{
	    if(message.channel.type !== ChannelType.GuildText) return;


	    let boosterUsers = [ ]
	    let boosterChannels = [ ]
	    let noChannelBoosters = ' '    
	    let channelsList = ''
	    let channelsToMove = ''
	    let serverId = message.guild.id
	    
	    // get all users with the "booster role" and their registered channels

	    let getUsers = message.guild.roles.cache.get('1142141020218347601').members.map(m=>m.user.tag);
	    for(let i = 0; i < getUsers.length; i++) {
		    let userTag = getUsers[i] 
		    const member = message.guild.members.cache.find(member => member.user.tag === userTag);
		    const getChannel = await checkisland(member.user.id, serverId)
		    boosterUsers.push([member.user.id, getChannel.channel])

	    }

	    // get all channels under the booster category 
	    let categoryChannels = message.guild.channels.cache.filter((channel) => {
  			if (channel.parentId === "1147909067172483162"){
				let channelID = channel.id
				boosterChannels.push(channelID)
				channelsList = channelsList.concat(`\n> <#${channelID}>`)
			}
		});


	    // nmake a list of Users that boost but dont have a channel

	    for(let i = 0; i < boosterUsers.length; i++){
		    if(typeof(boosterUsers[i][1]) === "undefined"){
			    noChannelBoosters = noChannelBoosters.concat(`\n> <@!${boosterUsers[i][0]}>`)

		    }
	    } 

	   //  make a list of channels where id is not a booster
	   for(let i = 0; i < boosterChannels.length; i++) {
		    	let getChannelUsers = await getisland(boosterChannels[i]) 
			let user = getChannelUsers.user
			if(user) {
				let userInfo = message.guild.members.cache.get(user)
				if(!(userInfo.roles.cache.some(role => role.id === '1142141020218347601')) &&
					(getChannelUsers.channel !== '1246550644479885312')){
					channelsToMove = channelsToMove.concat(`\n> <#${getChannelUsers.channel}>`)
				}

			}
	   }
	   // in case of zero violations 
	   if(channelsToMove.length <= 0){
		   channelsToMove = channelsToMove.concat(`\n> No Violation`)
	   }
	   let getUserDiscordInfo = message.author.id
	   console.log(getUserDiscordInfo)
	   
	   let embed = new EmbedBuilder()
	    	.setTitle("Staff Channel Manager:  Booster Channels ")
                .setDescription(`Boosters and Their Channels
				Move channels to the right category using ep upgrade`)
                .addFields({name:"__Channels In Booster Category with No Boost__", value:`${channelsToMove}`, inline: true},
			   {name:"__Users Who Boost With No Channel__", value:`${noChannelBoosters}`, inline: true},
			   {name:"__All Booster Channels__", value: `${channelsList}`, inline: false} 
		)
	        .setColor(`#097969`)

	await message.reply({embeds:[embed]})

    }catch(err)
    {console.log(err)}
  }
} as PrefixCommandModule;
