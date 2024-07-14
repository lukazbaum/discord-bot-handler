import {  Client, GuildChannel, GuildMember,  ChannelType, Message, ChannelManager,  EmbedBuilder,  MessageMentions} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {getcowners, insertcowner, getisland, adduser, addedusers, removeban, isOwner} = require('../../../util/functions');

export = {
    name: "addcowner",
    aliases: ["Addcowner", "addowner", "addco"],
    type: CommandTypes.PrefixCommand,
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1246691890183540777'],
    categoryWhitelist: ['1147909156196593787', '1147909067172483162','1140190313915371530'],
    async execute(message: Message): Promise<void> {
	 try{
		if(message.channel.type !== ChannelType.GuildText) return;
                // This whole Block checks for the channel owner and if not channel owner
                 // if its not the channel owner, checks for the staff role
                 // if user is a staff member, they can run the command
                 // if user is a channel owner or a cowner on the channel,
                 // then they are authorized.

                let getOwner = await isOwner(message.author.id)
                let checkStaff = await  message.guild.members.cache.get(message.author.id)
                let channel = message.channel.id

                //handles null values
                let checkOwner = getOwner && getOwner.some((authorized) => authorized.channel === channel)

                if(!checkOwner){
                        if(!(checkStaff.roles.cache.has('1148992217202040942'))){
                                await message.reply('you must be an owner/cowner of this channel to run this command')
                                return;

                        }else if(checkStaff.roles.cache.has('1148992217202040942')){
                                console.log("Addcowner Ran In: ", message.channel.id, "by", message.author.id)
                        }
                }

	    	const id = await message.mentions.users.first().id
	    	const cleanid = await id.replace(/\D/g, '');
	    	const checkAdds = await addedusers(message.channel.id);
            	const channelInfo = await getisland(message.channel.id);
	    	const isAdded = checkAdds && checkAdds.some((added) => added.user === cleanid)
	    	let cowners = ' ' 
	    	let addlist = ' '
	    	let cownerRole = '1246691890183540777'

	    	if(id  === message.author.id){
                	  await message.reply("Seriously? <a:ep_bozabonk:1164312811468496916>")
			  	return;
	    	}

	    	Object.entries(channelInfo).forEach(([key, value]) => {
			   cowners = cowners.concat(`${key}:${value},`) 
	    	});

	    	let cownersTemp = cowners.split(",")
                        .map(pair => pair.split(":"));
	    	const result = Object.fromEntries(cownersTemp);
	   
	    	function getOwners(obj, value) {
			    return Object.keys(obj)
		    	.filter(key => obj[key] === value);
	    	}

	    	var cownersArray = [channelInfo.cowner1,
			    		channelInfo.cowner2,
	    				channelInfo.cowner3,
					channelInfo.cowner4,
					channelInfo.cowner5,
					channelInfo.cowner6,
					channelInfo.cowner7]
            	var filteredOwners: string[] = cownersArray.filter((s): s is string => !!(s));
            	let cownersList = ' '

	    	if(filteredOwners.length >= 7){
			    await message.reply("You have the max amount of cowners. Remove a cowner to make room")
		    		return;
	    	}
	    
	    	if(Object.values(result).indexOf(cleanid) >= 0) {
			    await message.reply("user is already a cowner")
		    		return;
	    	}
	    
	    	let availableSpot = getOwners(result, 'null')
	    	let channelCowner = message.guild.members.cache.get(cleanid)
	    	await insertcowner(message.channel.id, `${availableSpot[0]}`, cleanid)
	    	await message.channel.permissionOverwrites.edit(cleanid, {
                        ViewChannel:true,
                        SendMessages: true,
                        });
	    	await channelCowner.roles.add(cownerRole)  

	    	let embed1 = new EmbedBuilder()
	   		.setTitle("Channel Manager: Add CO-owner")
			.setDescription(`<@!${cleanid}> has been added as a cowner

					*to remove a cowner, use command ep remcowner*`)
			.setColor(`#097969`)

	   	await message.reply({embeds:[embed1]})

		}catch(err)
       	{console.log(err)}
    	}
} as PrefixCommandModule;
