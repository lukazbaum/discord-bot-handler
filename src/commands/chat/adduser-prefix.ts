import {  Client, GuildChannel, GuildMember,  ChannelType, Message, ChannelManager,  EmbedBuilder,  MessageMentions} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {isOwner, adduser, addedusers, removeban} = require('../../../util/functions');

export = {
    name: "add",
    aliases: ["Add", "adduser", "Adduser"],
    type: CommandTypes.PrefixCommand,
    roleWhitelist: ['1147864509344661644', '1148992217202040942', '1246691890183540777','1246691890183540777'],
    categoryWhitelist: ['1147909067172483162',
	    		'1147909156196593787',
			'1147909539413368883',
			'1147909373180530708',
			'1147909282201870406',
			'1147909200924643349',
			'1140190313915371530'],
    async execute(message: Message): Promise<void> {
	try{
		let checkOwner = await isOwner(message.author.id)
                if(checkOwner[0].channel !== message.channel.id) {
                        await message.reply('you must be an owner/cowner of this channel to run this command')
                        return;
                }
		if(message.channel.type !== ChannelType.GuildText) return;
		if (!message.mentions.users.map(m => m).length) {
		    await message.reply('Did you forget to add the user?')
		    return;
		}
		const id = await message.mentions.users.first().id
		const checkAdds = await addedusers(message.channel.id);
		let cleanid = await id.replace(/\D/g, '');
		const memberTarget = message.guild.members.cache.get(id)
            
		if(id  === message.author.id){
			await message.reply("Seriously? <a:ep_bozabonk:1164312811468496916>")
			return;
		}
	    
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
	}catch(err)
        {console.log(err)}
    },
} as PrefixCommandModule;
