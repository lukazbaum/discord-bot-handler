import { TextChannel, Message, ChannelType, EmbedBuilder } from "discord.js";
import { PrefixCommand } from '../../handler';
const { guildBan, updateGuildBan } = require('/home/ubuntu/ep_bot/extras/functions');


export default new PrefixCommand({
    name: "removeserverban",
    aliases: ["ub", "rsb", "ubuser", "usb", "sub"],
	// 1113339391419625572 - Epic Wonderland
	// 1135995107842195550 - Epic Park
	// 839731097473908767 - Blackstone
	allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767'],
	allowedRoles:["1148992217202040942","1113414355669753907", "1113407924409221120",
					'845499229429956628', // Blackstone Staff,
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

		await updateGuildBan(user, 'unban', reason, message.author.id, String(date))
		
		let embed = new EmbedBuilder()
			.setTitle("Staff Manager: Remove Server Ban")
			.setDescription(`**Action**: UnBan
					**User**: ${user}
					**Reason**: ${reason}	
					**Date:** ${String(date)}
					**Removed By:** ${message.author.username}`)

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
