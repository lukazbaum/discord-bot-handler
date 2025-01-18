import { Message } from "discord.js";
import { PrefixCommand } from '../../handler';
const {updateLove, getpoints, updateScore, addNewscore } = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
    name: "love",
    aliases: ["givelove", "Love", "gl", "loves"],
	// 1113339391419625572 - Epic Wonderland
	// 1135995107842195550 - Epic Park
	// 839731097473908767 - Blackstone
	allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767'],
	allowedRoles: ['1147864509344661644', '1148992217202040942','1246691890183540777','1143236724718317673',
			'807811542057222176',
			'1113407924409221120', // epic wonderland staff
			'1113451646031241316', // epic wonderland users
			'845499229429956628', // Blackstone Staff
			'839731097633423389' // Blackstone Users
			],
	userCooldown: 30,
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
			await message.reply('You can love yourself, just not this way')
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
		await updateLove(giveId, serverId)
		await updateScore(message.author.id, serverId)
		await message.reply({ content:`<@!${giveId}> got love from <@!${message.author.id}>`, allowedMentions: { repliedUser: false }})

	
	}catch(err) {
        	console.log(err)}

	}
});

