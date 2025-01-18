import { TextChannel, Message, ChannelType,EmbedBuilder } from "discord.js";
import { PrefixCommand } from '../../handler';
const { guildBan } = require('/home/ubuntu/ep_bot/extras/functions');


export default new PrefixCommand({
    name: "banserver",
    aliases: ["bs", "serverban", "sb"],
	// 1113339391419625572 - Epic Wonderland
	// 1135995107842195550 - Epic Park
	// 839731097473908767 - Blackstone
	allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767'],
	allowedRoles:["1148992217202040942","1113407924409221120",
		'845499229429956628', // Blackstone Staff
	],
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
		let serverId = message.channel.guildId

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

		const modRoleList: { [key: string]: string } = {
			"1135995107842195550": "1148992217202040942", // epic park staff
			'1113339391419625572':'1113407924409221120', // epic wonderland staff
			"839731097473908767": "845499229429956628", // blackstone staff royal guards
		};

		const roleId = Object.entries(modRoleList).find(([key, val]) => key === serverId)?.[1];
		let checkStaff = await  message.guild.members.cache.get(message.author.id)

		if(checkStaff.roles.cache.has(roleId)){
			console.log("Server Ban User Ran In: ", message.channel.id, "by", message.author.id)
		} else {
			await message.reply('only moderators can bad users at the server level')
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

		const banChannel: { [key: string]: string } = {
			"1135995107842195550": "1160751610771820554", // epic park
			'1113339391419625572':'1115941478007582740', // epic wonderland staff
			"839731097473908767": "839731097754533897", // blackstone warn logs
		};

		const getBanChannel = Object.entries(banChannel).find(([key, val]) => key === serverId)?.[1];

		const banlog = await message.guild.channels.cache.find(channel => channel.id === getBanChannel) as TextChannel;
                banlog.send({embeds: [embed]})
        		await message.reply({embeds: [embed]})

	}catch(err)
	    {console.log(err)}

    }
});
