import {  Client, GuildChannel, GuildMember,  ChannelType, Message, ChannelManager,  EmbedBuilder,  MessageMentions} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {getcowners, insertcowner, getisland, adduser, addedusers, removeban} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "addcowner",
    aliases: ["Addcowner", "addowner", "addco"],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966"],
    ownerOnly: true,
    async execute(message: Message): Promise<void> {
	    if(message.channel.type !== ChannelType.GuildText) return;
	    if (!message.mentions.users.map(m => m).length) {
		    await message.reply('Did you forget to add the user?')
		    return;
	    }
	    const id = await message.mentions.users.first().id
	    const cleanid = await id.replace(/\D/g, '');
	    const checkAdds = await addedusers(message.channel.id);
            const channelInfo = await getisland(message.channel.id);
	    const isAdded = checkAdds.some((added) => added.user === cleanid)
	    let cowners = ' ' 
	    let addlist = ' '


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
	   
	    function getOwner(obj, value) {
		    return Object.keys(obj)
		    .filter(key => obj[key] === value);
	    }
	    var cownersArray = [channelInfo.cowner1,channelInfo.cowner2,channelInfo.cowner3,channelInfo.cowner4,channelInfo.cowner5,channelInfo.cowner6,channelInfo.cowner7]
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
	    
	    let availableSpot = getOwner(result, 'null')
	    await insertcowner(message.channel.id, `${availableSpot[0]}`, cleanid)
	    await message.channel.permissionOverwrites.edit(cleanid, {
                        ViewChannel:true,
                        SendMessages: true,
                        });

	    let embed1 = new EmbedBuilder()
	   	.setTitle("Channel Manager: Add CO-owner")
		.setDescription(`<@!${cleanid}> has been added as a cowner

				*to remove a cowner, use command ep remcowner*`)
		.setColor(`#097969`)

	   	await message.reply({embeds:[embed1]})
    },
} as PrefixCommandModule;
