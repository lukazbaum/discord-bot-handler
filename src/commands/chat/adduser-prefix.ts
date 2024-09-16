import {  Client, GuildChannel, GuildMember,  ChannelType, Message, ChannelManager,  EmbedBuilder,  MessageMentions} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {isOwner, adduser, addedusers, removeban} = require('../../../util/functions');

export = {
    name: "adduser",
    aliases:  ["useradd","addusers", "Adduser", "au"],
    type: CommandTypes.PrefixCommand,
    guildWhitelist: ['1135995107842195550', '801822272113082389'],
    roleWhitelist: ['1147864509344661644', '1148992217202040942', '1246691890183540777','1246691890183540777',
    			'807826290295570432', '1073788272452579359','807826290295570432','1262566008405622879'],
    categoryWhitelist: ['1147909067172483162',
	    		'1147909156196593787',
			'1147909539413368883',
			'1147909373180530708',
			'1147909282201870406',
			'1147909200924643349',
			'1140190313915371530',
    			'1203928376205905960',
                        '1232728117936914432',
                        '1192106199404003379',
                        '1192108950049529906',
                        '1225165761920630845',
                        '966458661469839440',
	    		'808109909266006087',
                        '825060923768569907'],
    async execute(message: Message): Promise<void> {
	try{
		if(message.channel.type !== ChannelType.GuildText) return;
                // This whole Block checks for the channel owner and if not channel owner
                 // if its not the channel owner, checks for the staff role
                 // if user is a staff member, they can run the command
                 // if user is a channel owner or a cowner on the channel / mentioned channel,
                 // then they are authorized.

                let getOwner = await isOwner(message.author.id)
                let checkStaff = await  message.guild.members.cache.get(message.author.id)
                let channel = message.channel.id
		let serverId = message.guild.id

                	//handles null values
                let checkOwner = getOwner && getOwner.some((authorized) => authorized.channel === channel)

	 	const modRoleList: { [key: string]: string } = {
                        "1135995107842195550": "1148992217202040942",
                        "801822272113082389": "807826290295570432",
                        };

                const roleId = Object.entries(modRoleList).find(([key, val]) => key === serverId)?.[1];



                if(!checkOwner){
                        if(!(checkStaff.roles.cache.has(roleId))){
                                await message.reply('you must be an owner/cowner of this channel to run this command')
                                return;

                        }else if(checkStaff.roles.cache.has(roleId)){
                                console.log("Add User Ran In: ", message.channel.id, "by", message.author.id)
                        }
                }

			// check for a valid username or id 
		let messageContent = message.content.toString().toLowerCase();
            	let messageContentSplit = messageContent.split(" ");
            	let userName = message.mentions.users.first();
		let id;
		if(!userName){
                	if(Number.isInteger(Number(messageContentSplit[0]))){
				id = messageContentSplit[0]
                    	}else{
				await message.reply("please specify a valid userid or username")
				return;
			}
		}else if(userName) {
			id = message.mentions.users.first().id
		}


			// check if user is already added to db and not staff
		const checkAdds = await addedusers(message.channel.id);
		let cleanid = await id.replace(/\D/g, '');
		const memberTarget = message.guild.members.cache.get(cleanid)
		if(cleanid === message.author.id){
			await message.reply("Seriously? <a:ep_bozabonk:1164312811468496916>")
			return;
		}
	    
		const isAdded = checkAdds && checkAdds.some((added) => added.user === cleanid) 

	    	if(isAdded) {
			    await message.reply('user is already added')
	    	} else {
	   			// if user is not added, add user to db and channel 
	    		await adduser(cleanid, message.channel.id)
			await removeban(cleanid, message.channel.id)
	        	await message.channel.permissionOverwrites.edit(cleanid, {
				ViewChannel:true,
				SendMessages: true,
				});
	    		}
			// generate response embed
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
