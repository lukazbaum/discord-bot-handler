import {CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
import { Message, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
const { isOwner } = require('/home/ubuntu/ep_bot/extras/functions')

export = {
    name: "hide",
    aliases: ["Hide", "unhide", "Unhide"],
    type: CommandTypes.PrefixCommand,
    categoryWhitelist: ['1140190313915371530',
                        '1147909156196593787',
                        '1147909539413368883',
                        '1147909373180530708',
                        '1147909282201870406',
                        '1147909200924643349',
                        '1147909067172483162',
                        '1140190313915371530'],
    async execute(message: Message): Promise<void> {
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
       		let embed = new EmbedBuilder()
	       		.setTitle("Channel Manager: Hide/Unhide")
		    	.setDescription(`
			    *Hiding Channels removes the ability for all users to view channel except added users.*
			    *To stop messages from users not explicitly added but keep it visible, use lock *\n`)
                    	.setColor('#097969')

			const row: any = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId("channel_hide")
						.setLabel("Hide Channel")
						.setStyle(ButtonStyle.Primary)
						.setEmoji("🔐"),
					new ButtonBuilder()
						.setCustomId("channel_unhide")
						.setLabel("Unhide Channel")
						.setStyle(ButtonStyle.Primary)
						.setEmoji("🔓"),
					new ButtonBuilder()
						.setCustomId("cancel")
						.setLabel("Cancel")
						.setStyle(ButtonStyle.Danger)
						.setEmoji("✖️")
				)	
			await message.reply({embeds:[embed], components: [row] });
    }
} as PrefixCommandModule;

