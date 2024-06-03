import { Message, MessageManager, MessageCollector } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {getisland, isOwner} = require('/home/ubuntu/ep_bot/extras/functions');
export = {
    name: "pin",
    aliases: ["pinn", "Pin"],
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
		let checkOwner = await isOwner(message.author.id)
                if(checkOwner[0].channel !== message.channel.id) {
                        await message.reply('you must be an owner/cowner of this channel to run this command')
                        return;
                }
	    	const channelInfo = await getisland(message.channel.id);
            	const user = message.author.id


	    	if(!message.reference){
			await message.reply("reply to the message you want pinned")
		    	return;
	    	}

	    //@ts-ignore
	    	let repliedTo = await message.fetchReference(message.reference.messageId)
            	if(repliedTo.pinned){
			await message.reply("Message Has A Pin.")
		    	return;
	    	}else{
		    	await repliedTo.pin()
        	    	message.reply("Your Message is Pinned")
	    	}

	}catch(err)
  	{console.log(err)}
    }
} as PrefixCommandModule;
