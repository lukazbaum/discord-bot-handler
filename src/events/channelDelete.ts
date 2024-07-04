import { EventModule } from "../handler";
import { Events, Message } from "discord.js";
import { handleMessageCommands } from "../handler/util/handleChatCommands";

export = {
    name: Events.ChannelDelete,
    async execute(channel): Promise<void> {
	const {getisland, addedusers, removeuser, removecowners, removeisland, bannedusers} = require('/home/ubuntu/ep_bot/extras/functions');
	let island = await getisland(channel.id)
    	if(!island) return
    	let addlist = await addedusers(channel.id)
    	if(addlist.length) {
    	for(let i=0;i<addlist.length;i++) await removeuser(addlist[i].user, channel.id)
    	}
    	let banList = await bannedusers(channel.id)
    	if(banList.length) {
    	for(let i=0;i<banList.length;i++) await removeuser(addlist[i].user, channel.id)
    	}
    	for(let i=1;i<8;i++) {
        	await removecowners(channel.id, i)
    	}
    	await removeisland(channel.id)


    }
} as EventModule;
