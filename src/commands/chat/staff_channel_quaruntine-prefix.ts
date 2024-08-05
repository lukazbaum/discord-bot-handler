import {  Message, ButtonStyle, ButtonBuilder, ActionRowBuilder, GuildChannelManager, EmbedBuilder}  from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { getisland } = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "quaruntine",
    aliases: ["Quaruntine", "qch"],
    type: CommandTypes.PrefixCommand,
    guildWhitelist: ['1135995107842195550'],
    roleWhitelist:["1148992217202040942"],
    optionalCategoryWhitelist:["1140190313915371530"],
    optionalChannelWhitelist:["1147233774938107966", "1138531756878864434", "1151411404071518228"],
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
                    .setDescription(`Quaruntining a channel moves channels to <#1219009472593399909>.  It does not remove records and are recoverable.`)
                    .setColor('#097969')

        	const row: any = new ActionRowBuilder()
        		.addComponents(
                		new ButtonBuilder()
                        		.setCustomId("confirm_qc")
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
}  as PrefixCommandModule;
