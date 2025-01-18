import { Message, EmbedBuilder } from "discord.js";
import { PrefixCommand } from '../../handler';
const {checkfav, favChannels} = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
    name: "home",
    aliases: ["takemehome", "tohome", "phonehome", "ethome"],
    allowedGuilds: ['1135995107842195550', ],
    allowedRoles: ['1147864509344661644', '1148992217202040942','1147864509344661644','807811542057222176'],
    async execute(message: Message): Promise<void> {
	try{
	
	}catch(err)
  	{console.log(err)}
    }
});
