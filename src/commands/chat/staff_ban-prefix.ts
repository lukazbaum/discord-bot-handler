import { TextChannel, Message, ChannelType, ChannelManager, Role, GuildChannel, GuildMember, BitField, PermissionsBitField, EmbedBuilder } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { guildBan } = require('/home/ubuntu/ep_bot/extras/functions');


export = {
    name: "banserver",
    aliases: ["bs", "serverban", "sb"],
    type: CommandTypes.PrefixCommand,
	// 1113339391419625572 - Epic Wonderland
	// 801822272113082389 - Epic
	// 1135995107842195550 - Epic Park
	guildWhitelist: ['1135995107842195550', '1113339391419625572'],
    roleWhitelist:["1148992217202040942","1113407924409221120"],
    async execute(message: Message): Promise<void> {
	try{
		if(message.channel.type !== ChannelType.GuildText) return;

		let messageContent = message.content.toString().toLowerCase()
		let messageContentSplit = messageContent.split(" ");
		let userName = message.mentions.users.first()
		let user;
		let getUsername;
		let reason;
		let buildReason;
		function isNumber(value) {
                	return !isNaN(value);
                }
		console.log("content info: ", messageContentSplit[0])
		if(!userName) {
			if(isNumber(messageContentSplit[0])){
				getUsername = await message.guild.members.cache.get(messageContentSplit[0])
				console.log("Get username: ", getUsername)
				if(!(getUsername)){
					await message.reply(`${messageContentSplit[0]} is  not a guild member`)
					return;
				}
				user = getUsername.user.id
					buildReason = messageContentSplit.slice(1)
					reason = String(buildReason).replaceAll(",", " ")
            		}
		}else if(userName) {
			user = userName.id
			buildReason = messageContentSplit.slice(1)
                        reason = String(buildReason).replaceAll(",", " ")
		}
		
		let checkUser = await message.guild.members.cache.get(user)
		if(checkUser.roles.cache.has("1140520446241034290")) {
			await message.reply("you can not ban server bots")
			return;
		}else if(user === message.author.id){
			await message.reply("you cant ban yourself.")
			return;
		}
		if(reason.length === 0){
                        reason = "no reason supplied"
                }

		let date = new Date().toLocaleString()
		date = String(date.replace(',', ""))
		await guildBan(user, 'ban', reason, message.author.id, String(date))
		await message.guild.bans.create(`${user}`,{ deleteMessageSeconds: 60 * 60 * 24 * 7, reason: `${reason}` })
		
		let embed = new EmbedBuilder()
			.setTitle("Staff Manager: Server Ban")
			.setDescription(`**Action**: Server Ban
					**User**: ${user}
					**Reason**: ${reason}	
					**Date:** ${String(date)}
					**Set By: ** ${message.author.username}
					**Messages Deleted**: 7 Days Worth of Messages Deleted`) 

		var banlog = await message.guild.channels.cache.find(channel => channel.id === `1160751610771820554`) as TextChannel;
                banlog.send({embeds: [embed]})
        	await message.reply({embeds: [embed]})

	}catch(err)
	    {console.log(err)}

    }
} as PrefixCommandModule;
