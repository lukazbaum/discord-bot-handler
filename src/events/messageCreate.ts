import { EventModule } from "../handler";
import {ChannelType, PermissionFlagsBits,  Events, Message } from "discord.js";
import { handleMessageCommands } from "../handler/util/handleChatCommands";
const features ={ event:require('../../util/events2.js')}
    
const { getisland } = require('/home/ubuntu/ep_bot/extras/functions');


export = {

    name: Events.MessageCreate,
    async execute(message: Message): Promise<void> {
    try{
        if(message.author.bot) return;
        // Handles Prefix, Ping and Message commands.
        await handleMessageCommands(message);
	    // handle RPG Events for auto ping
        if(message.channel.type !== ChannelType.GuildText) return;
	
	if(message.author.id === "555955826880413696"){
		if(message.channel.parentId === "1140190313915371530") {
            		features.event.message(message, PermissionFlagsBits)
        	}else {
			let is = await getisland(message.channel.id)
			if(is.events) {
				features.event.message(message, PermissionFlagsBits)
			}
		}
	}

    }catch(err)
        {console.log(err)}
    }
} as EventModule;
