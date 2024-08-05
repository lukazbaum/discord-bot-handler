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

    }catch(err)
        {console.log(err)}
    }
} as EventModule;
