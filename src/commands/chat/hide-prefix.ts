import {CommandTypes, PrefixCommandModule} from "../../handler/types/Command";
import { Message, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

export = {
    name: "hide",
    aliases: ["Hide", "unhide", "Unhide"],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966"],
    ownerOnly: true,
    async execute(message: Message): Promise<void> {
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

