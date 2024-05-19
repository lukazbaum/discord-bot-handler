import {  Client, GuildChannel, GuildMember,  ChannelType, Message, ChannelManager,  EmbedBuilder,  MessageMentions} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {getcowners, bannedusers, addedusers, getisland } = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "info",
    aliases: ["channelinfo", "chinfo", "Info"],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966"],
    ownerOnly: true,
    async execute(message: Message): Promise<void> {
	    if(message.channel.type !== ChannelType.GuildText) return;
	    
	    const alladds = await addedusers(message.channel.id);
	    const allBans = await bannedusers(message.channel.id);
	    const channelInfo = await getisland(message.channel.id) 
	    
	    let addList = ' '
	    let bannedList =  ' '
	    let cowners = ' '
            let eventsState = ' '
	    let cownersList = [channelInfo.cowner1,channelInfo.cowner2,channelInfo.cowner3,channelInfo.cowner4,channelInfo.cowner5,channelInfo.cowner6,channelInfo.cowner7]
	    const filteredOwners: string[] = cownersList.filter((s): s is string => !!(s));

	    for(let i = 0; i < filteredOwners.length; i++) {
		    cowners = await cowners.concat(`\n> ${i+1}. <@!${filteredOwners[i]}>`)
	    }

	    for(let i = 0; i < alladds.length; i++) {
		    addList = await addList.concat(`\n> ${i+1}. <@!${alladds[i].user}>`)
                }
	    for(let i = 0; i < allBans.length; i++) {
		    bannedList = await bannedList.concat(`\n> ${i+1}. <@!${allBans[i].user}>`)
	    }

	    if(channelInfo.events === 1){
		    eventsState = "Events Enabled"
	    }else{
		    eventsState = "Events Disabled"
	    }


	    let embed1 = new EmbedBuilder()
	   	.setTitle("Channel Manager: Channel Info")
		.setDescription(`**Channel Owner:** <@!${channelInfo.user}>`)
	 	.addFields({name:"__Added Users__", value:`${addList}`, inline: true},
			  {name:"__Banned Users__", value: `${bannedList}`, inline: true},
			  {name:"__Current Cowners__", value: `${cowners}`, inline: true},
			  {name:"__Events On or Off?__", value: `${eventsState}`, inline: true}
			)
		.setColor(`#097969`)

	   	await message.reply({embeds:[embed1]})
    },
} as PrefixCommandModule;
