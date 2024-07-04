import { EventModule } from "../handler";
import { Events, Message, GuildMember } from "discord.js";
import { handleMessageCommands } from "../handler/util/handleChatCommands";
const {removeban, getisland, getislands, removeislanduser,addedusers, removeuser, removecowners, removeisland, banlist} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: Events.GuildMemberRemove,
    async execute(member: GuildMember): Promise<void> {
    let channels = (await getislands()).map(c=>c.channel)
    for(let i=0;i<channels.length;i++) {
        await removeban(member.id, channels[i])
        let island = await getisland(channels[i])
        let users = [island.cowner1,island.cowner2,island.cowner3,island.cowner4,island.cowner5,island.cowner6,island.cowner7]
        if(users.includes(member.id)) await removecowners(channels[i], users.indexOf(member.id) + 1)
        await removeuser(member.id, channels[i])
        await removeislanduser(member.id)
    }


    }
} as EventModule;
