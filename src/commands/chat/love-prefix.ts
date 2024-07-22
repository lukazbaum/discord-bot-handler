import { CommandInteraction, EmbedBuilder, Interaction, Message, MessageReaction, ButtonBuilder, ButtonStyle } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {updateLove, getpoints, updateScore, addNewscore } = require('/home/ubuntu/ep_bot/extras/functions'); 

export = {
    name: "love",
    aliases: ["givelove", "Love", "gl", "loves"],
    type: CommandTypes.PrefixCommand,
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1246691890183540777','1143236724718317673'],
    cooldown: 30,
    async execute(message: Message): Promise<void> {
	try{
		let messageContent = message.content
		let giveId; 
		if(message.mentions.users.map(m => m).length) {
                    giveId = message.mentions.users.first().id
		}else{
			await message.reply("please specify a user")
			return;
		}


            	if (giveId === message.author.id) {
                    await message.reply('You can love yourself, just not this way')
			return;
		}

            	let check_score = await getpoints(giveId)
            	let giver_score = await getpoints(message.author.id)
            	let sender = message.author.id
            	if (!check_score) {
                	    await addNewscore(`${giveId}`, 0, 0, 0, 0, 1, 0)
                }
            	if(!giver_score){
                	    await addNewscore(`${message.author.id}`,0, 0, 0, 0, 1, 0)
            	}
            	await updateLove(giveId)
           	await updateScore(message.author.id)
            	await message.reply({ content:`<@!${giveId}> got love from <@!${message.author.id}>`, allowedMentions: { repliedUser: false }})

	
	}catch(err) {
        	console.log(err)}

	}
} as PrefixCommandModule;

