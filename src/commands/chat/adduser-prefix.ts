import {
	Message,
	ButtonStyle,
	ButtonBuilder,
	ActionRowBuilder,
	EmbedBuilder,
} from 'discord.js';
import { PrefixCommand } from '../../handler';
import { resolveUserOrRole } from '../../handler/utils/resolveUserOrRole';
const { getisland } = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
	name: "recover",
	aliases: ["Recover", "rch", "rc"],
	allowedGuilds: ['1135995107842195550'],
	allowedRoles: ["1148992217202040942"],
	optionalAllowedCategories: ["1140190313915371530"],
	optionalAllowedChannels: ["1147233774938107966", "1138531756878864434", "1151411404071518228"],
	async execute(message: Message): Promise<void> {
		try {
			// Ensure the command was run in a guild
			if (!message.guild) {
				await message.reply("This command can only be used in a server.");
				return;
			}

			// Check if a channel was mentioned
			if (!message.mentions.channels.size) {
				await message.reply("You must specify a valid channel including the #.");
				return;
			}

			const getMessageContent = message.content;
			const channelTemp = getMessageContent.split('#');
			const channelId = channelTemp[1].replace(">", "").trim();

			// Validate the channel
			const channelInfo = await getisland(channelId);
			if (!channelInfo) {
				await message.reply('Channel is not assigned.');
				return;
			}

			// Resolve and validate user/role
			const validUserOrRole = await resolveUserOrRole(message.guild, message.author.id);
			if (!validUserOrRole) {
				await message.reply("You do not have the necessary permissions or roles to use this command.");
				return;
			}

			// Proceed with creating confirmation embed
			const confirmEmbed = new EmbedBuilder()
				.setTitle("Staff Channel Manager: Quarantine Channel")
				.setDescription(`Recovering a channel restores added and banned users. Ensure to place the channel in the correct category afterward.`)
				.setColor('#097969');

			const row = new ActionRowBuilder<ButtonBuilder>()
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
				);

			await message.reply({ embeds: [confirmEmbed], components: [row] });

		} catch (err) {
			console.error(err);
		}
	}
});