import { TextChannel, Message, ChannelType, ChannelManager, Role, GuildChannel, GuildMember, BitField, PermissionsBitField, EmbedBuilder } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { guildBan, updateGuildBan } = require('/home/ubuntu/ep_bot/extras/functions');


export = {
    name: "removeserverban",
    aliases: ["ub", "rsb", "ubuser", "usb", "sub"],
    type: CommandTypes.PrefixCommand,
    roleWhitelist:["1148992217202040942","1113414355669753907", "1113407924409221120"],
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
		buildReason = messageContentSplit.slice(1)
		reason = String(buildReason).replaceAll(",", " ")

		if(reason.length === 0){
                        reason = "no reason supplied"
                }
		console.log(userName)
		if(userName) {
			getUsername = await message.guild.bans.fetch(userName)
			console.log(getUsername)
			if (getUsername.user.username === userName) {
				await message.guild.members.unban(getUsername.user.id, reason)
				user = getUsername.user.id
			}else{
				message.reply("user is not listed as banned on this server")
				return;
			}
		
		}else if(!userName) {
			if(isNumber(messageContentSplit[0])){
				getUsername = await message.guild.bans.fetch(messageContentSplit[0])
                                if (getUsername.user.id === messageContentSplit[0]){
                                	message.guild.members.unban(getUsername.user.id, reason)
					user = getUsername.user.id 
					}else{
                                                message.reply("user is not listed as banned on this server")
                                                return;
					}
			}else{
				message.reply("please use a valid user id. `pm usb <validid> <reason>`")
				return;
			}
		}else{
			message.reply("please use a valid user id. `pm usb <validid> <reason>`")
                        return;
		}
				
		let date = new Date().toLocaleString()
		date = String(date.replace(',', ""))
		//let isBanned = await
		await updateGuildBan(user, 'unban', reason, message.author.id, String(date))
		
		let embed = new EmbedBuilder()
			.setTitle("Staff Manager: Remove Server Ban")
			.setDescription(`**Action**: UnBan
					**User**: ${user}
					**Reason**: ${reason}	
					**Date:** ${String(date)}
					**Removed By:** ${message.author.username}`)

		var banlog = await message.guild.channels.cache.find(channel => channel.id === `1160751610771820554`) as TextChannel;
                banlog.send({embeds: [embed]})
        	await message.reply({embeds: [embed]})

	}catch(err)
	    {console.log(err)}

    }
} as PrefixCommandModule;
