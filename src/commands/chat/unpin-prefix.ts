// @ts-nocheck
import { Message, MessageManager, MessageCollector } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {getisland, isOwner} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "unpin",
    aliases: ["Unpin", "removepin"],
    type: CommandTypes.PrefixCommand,
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1246691890183540777'],
    categoryWhitelist: ['1147909067172483162',
                        '1147909156196593787',
                        '1147909539413368883',
                        '1147909373180530708',
                        '1147909282201870406',
                        '1147909200924643349',
                        '1140190313915371530'],
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

                //handles null values
                let checkOwner = getOwner && getOwner.some((authorized) => authorized.channel === channel)

                if(!checkOwner){
                        if(!(checkStaff.roles.cache.has('1148992217202040942'))){
                                await message.reply('you must be an owner/cowner of this channel to run this command')
                                return;

                        }else if(checkStaff.roles.cache.has('1148992217202040942')){
                                console.log("Channel Unpin Ran In: ", message.channel.id, "by", message.author.id)
                        }
                }
	    	if(!message.reference){
			await message.reply("reply to the message you want the pin removed")
	   	 }	
	    	let repliedTo = await message.fetchReference(message.reference.messageId)
            	if(!repliedTo.pinned){
			await message.reply("Message is not pinned")
	    	}else{
			repliedTo.unpin()
        	    	message.reply("Your Message pin is removed")
    		}
	}catch(err)
       {console.log(err)}
    }
} as PrefixCommandModule;
