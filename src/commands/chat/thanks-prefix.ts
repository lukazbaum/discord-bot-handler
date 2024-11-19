import { CommandInteraction, EmbedBuilder, Interaction, Message, MessageReaction, ButtonBuilder, ButtonStyle } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {updateThanks, getpoints, updateScore, addNewscore } = require('/home/ubuntu/ep_bot/extras/functions'); 

export = {
    name: "thanks",
    aliases: ["thank", "thankyou", "Thanks", "gt"],
    type: CommandTypes.PrefixCommand,
	// 1113339391419625572 - Epic Wonderland
	// 801822272113082389 - Epic
	// 1135995107842195550 - Epic Park
	guildWhitelist: ['1135995107842195550', '1113339391419625572'],
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1246691890183540777',
					'1143236724718317673','807811542057222176',
					'1113407924409221120'], //epic wonderland staff
    cooldown: 30,
    async execute(message: Message): Promise<void> {
	try{
		let messageContent = message.content
		let giveId; 
                let serverId = String(message.guild.id)

		if(message.mentions.users.map(m => m).length) {
                    giveId = message.mentions.users.first().id
		}else{
			await message.reply("please specify a user")
			return;
		}


            	if (giveId === message.author.id) {
                    await message.reply('You can thank yourself, just not this way')
			return;
		}

            	let check_score = await getpoints(giveId, serverId)
            	let giver_score = await getpoints(message.author.id, serverId)
            	let sender = message.author.id
            	if (!check_score) {
                	    await addNewscore(`${giveId}`, `${serverId}`, 0, 0, 0, 0, 1, 0)
                }
            	if(!giver_score){
                	    await addNewscore(`${message.author.id}`, `${serverId}`, 0, 0, 0, 0, 1, 0)
            	}
            	await updateThanks(giveId, serverId)
           	await updateScore(message.author.id, serverId)
            	await message.reply({ content:`<@!${giveId}> got thanks from <@!${message.author.id}>`, allowedMentions: { repliedUser: false }})

	
	}catch(err) {
        	console.log(err)}

	}
} as PrefixCommandModule;

