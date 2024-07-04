import { Message } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { getisland,  disableevents, isOwner} = require("/home/ubuntu/ep_bot/extras/functions");

export = {
    name: "noevents",
    aliases: ["disableevents", "de", "disableevent"],
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
                let checkStaff = await  message.guild.members.cache.get(message.author.id)

                if(checkOwner[0].channel !== message.channel.id ){
                        if(checkStaff.roles.cache.has('1148992217202040942')){
                                // continue
                        }else{
                                await message.reply('you must be an owner/cowner of this channel to run this command')
                                         return;
                        }
                }
        	let is = await getisland(message.channel.id)
	        if(!is){ 
			await message.reply("This channel isn't assigned to a user.")
		}else{
	       		await disableevents(message.channel.id)
        		await message.reply("Epic RPG and Idle Alerts Are Disabled use `ep events` to re-enable.")
		}
	}catch(err)
  	{console.log(err)}
    }
} as PrefixCommandModule;
