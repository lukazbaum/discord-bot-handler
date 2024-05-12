import {  Client, GuildChannel, GuildMember, PermissionsBitField, ChannelType, Message, ChannelManager,  EmbedBuilder,  MessageMentions} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {banuser, bannedusers, removeuser} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "ban",
    aliases: ["Ban"],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966"],
    ownerOnly: true,
    async execute(message: Message): Promise<void> {
	    if(message.channel.type !== ChannelType.GuildText) return;
	    if (!message.mentions.users.map(m => m).length) {
		    await message.reply('Did you forget to add the user?')
		    return;
	    }
         //@ts-ignore
	    const id = await message.mentions.users.first().id
	    const checkbans = await bannedusers(message.channel.id);
	    let cleanid = await id.replace(/\D/g, '');
	    //@ts-ignore
	    const memberTarget = message.guild.members.cache.get(id)
	    //@ts-ignore
	    if (memberTarget.roles.cache.has("1148992217202040942")) {

		    await message.reply('Nice. You cant ban a staff member')
		    return;
	    }
            
	    if(id  === message.author.id){
                  await message.reply("Seriously? <a:ep_bozabonk:1164312811468496916>")
		  return;
	    }
	    

	    //@ts-ignore
	    const isBanned = checkbans.some((banned) => banned.user === cleanid) 
	    if(isBanned) {
		    await message.reply('user is already banned')
		    return;
	    } else {
	    
	    	await banuser(cleanid, message.channel.id)
		await removeuser(cleanid, message.channel.id)
	        await message.channel.permissionOverwrites.edit(cleanid, {ViewChannel:false});
	    }
	   //@ts-ignore
	    let banlist = " "
	    const allbans = await bannedusers(message.channel.id);
	    for (let i = 0;i < allbans.length; i++) {
                        banlist = await banlist.concat(`\n> ${i+1}. <@!${allbans[i].user}>`)
                }
	    let embed1 = new EmbedBuilder()
	   	.setTitle("Channel Manager: Ban Channel User")
		.setDescription(`__Current List of Banned Users__
				${banlist}
				*to unban a user, use command ep unban*`)
		.setColor(`#097969`)

	   	await message.reply({embeds:[embed1]})
    },
} as PrefixCommandModule;
