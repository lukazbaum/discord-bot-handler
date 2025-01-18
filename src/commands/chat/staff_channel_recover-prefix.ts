import {  Message, ButtonStyle, ButtonBuilder, ActionRowBuilder, GuildChannelManager, EmbedBuilder}  from "discord.js";
import { PrefixCommand } from '../../handler';
const { getisland } = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
    name: "recover",
    aliases: ["Recover", "rch", "rc"],
	allowedGuilds: ['1135995107842195550'],
	allowedRoles:["1148992217202040942"],
	optionalAllowedCategories:["1140190313915371530"],
	optionalAllowedChannels:["1147233774938107966", "1138531756878864434", "1151411404071518228"],
    async execute(message: Message): Promise<void> {
	    try{ 
		if(message.mentions.channels.map(m => m).length){
		}else{
                        await message.reply("you must specifiy a valid channel including the #")
                        return;
                }
		let channelTemp = message.mentions.channels.first()
		let channelId = `${channelTemp.id}`
		let channelInfo = await getisland(channelId)
		if(!channelInfo) {
			message.reply('Channel is not assigned')
			return;
		}
		let confirmEmbed = new EmbedBuilder()
                    .setTitle("Staff Channel Manager: Quaruntine Channel")
                    .setDescription(`Recovering a channel puts back all added and banned users. You will need to put the channel in the right category.`)
                    .setColor('#097969')

        	const row: any = new ActionRowBuilder()
        		.addComponents(
                		new ButtonBuilder()
                        		.setCustomId("confirm_rc")
                        		.setLabel("Confirm")
                        		.setStyle(ButtonStyle.Primary)
                        		.setEmoji("✅"),
                		new ButtonBuilder()
                        		.setCustomId("cancel")
                        		.setLabel("Cancel")
                        		.setStyle(ButtonStyle.Danger)
            				.setEmoji("✖️")
			)

                await message.reply({embeds:[confirmEmbed], components: [row] });
                
	    }catch(err)
	    {console.log(err)}
    }
});
