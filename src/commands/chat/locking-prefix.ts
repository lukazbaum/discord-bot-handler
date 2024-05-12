import {CommandTypes, PrefixCommandModule} from "../../handler/types/Command";
import { Message, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
const {addedusers, getisland} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "lock",
    aliases: ["unlock"],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966"],
    ownerOnly: true,
    async execute(message: Message): Promise<void> {
	let island = await getisland(message.channel.id)
	let addids = await addedusers(message.channel.id)
	let userlist = " "
                for (let i = 0;i < addids.length; i++) {
                        userlist = await userlist.concat(`\n added: <@!${addids[i].user}>`)
                }
	let ownerlist = " "
	let cowners = [island.user,island.cowner1,island.cowner2,island.cowner3,island.cowner4,island.cowner5,island.cowner6,island.cowner7]
        	for(let i = 0;i < 7; i++) {
			ownerlist = await ownerlist.concat(`\n owner: <@!${cowners[i]}>`)
			}
       let embed = new EmbedBuilder()
	       	    .setTitle("Channel Locking")
		    .setDescription(`
				    *Locking Channels removes the ability for all users to chat except added users.*
				    *Channel is still publicly visible. hide/unhide affects visibility*\n
				    __Members Not Affected by Lock:__
				     ${userlist}
				     ${ownerlist}
				     `)
                    .setColor('#097969')

	const row: any = new ActionRowBuilder()
	.addComponents(
		new ButtonBuilder()
			.setCustomId("channel_lock")
			.setLabel("Lock Channel")
			.setStyle(ButtonStyle.Danger)
			.setEmoji("🔐"),
		new ButtonBuilder()
			.setCustomId("channel_unlock")
			.setLabel("Unlock Channel")
			.setStyle(ButtonStyle.Success)
			.setEmoji("🔓")
		)
	await message.reply({embeds:[embed], components: [row], });
    }
} as PrefixCommandModule;

