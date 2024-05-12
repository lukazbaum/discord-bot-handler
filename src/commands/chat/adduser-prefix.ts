import {  Client, GuildChannel, GuildMember,  ChannelType, Message, ChannelManager,  EmbedBuilder,  MessageMentions} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {adduser, addedusers, removeban} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "add",
    aliases: ["Add"],
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
	    const checkAdds = await addedusers(message.channel.id);
	    let cleanid = await id.replace(/\D/g, '');
	    //@ts-ignore
	    const memberTarget = message.guild.members.cache.get(id)
	    //@ts-ignore
            
	    if(id  === message.author.id){
                  await message.reply("Seriously? <a:ep_bozabonk:1164312811468496916>")
		  return;
	    }
	    

	    //@ts-ignore
	    const isAdded = checkAdds.some((added) => added.user === cleanid) 
	    if(isAdded) {
		    await message.reply('user is already added')
	    } else {
	    
	    	await adduser(cleanid, message.channel.id)
		await removeban(cleanid, message.channel.id)
	        await message.channel.permissionOverwrites.edit(cleanid, {
			ViewChannel:true,
			SendMessages: true,
			});
	    }
	   //@ts-ignore
	    let addlist = " "
	    const alladds = await addedusers(message.channel.id);
	    for (let i = 0;i < alladds.length; i++) {
                        addlist = await addlist.concat(`\n> ${i+1}. <@!${alladds[i].user}>`)
                }
	    let embed1 = new EmbedBuilder()
	   	.setTitle("Channel Manager: Add Channel User")
		.setDescription(`__Current List of Added Users__
				${addlist}\n
				*to ban a user, use command ep ban*`)
		.setColor(`#097969`)

	   	await message.reply({embeds:[embed1]})
    },
} as PrefixCommandModule;
