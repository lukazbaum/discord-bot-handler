import { ChannelType, Message, EmbedBuilder } from "discord.js";
import { PrefixCommand } from "../../handler";
const { checkisland, getisland } = require("/home/ubuntu/ep_bot/extras/functions");

export default new PrefixCommand({
	name: "boostercheck",
	aliases: ["bc", "boosts"],
	allowedGuilds: ["1135995107842195550"],
	allowedRoles: ["1136168655172947988"],
	allowedCategories: ["1137072690264551604", "1140190313915371530"],
	async execute(message: Message): Promise<void> {
		if (message.channel.type !== ChannelType.GuildText) return;

		try {
			const boosterRoleId = "1142141020218347601";
			const boosterCategoryId = "1147909067172483162";
			const excludedChannelId = "1246550644479885312"; // Excluded channel ID

			// Send an ephemeral-like message to notify the user
			const notificationMessage = await message.reply({
				content: "🔄 Generating the booster list. Please wait...",
			});

			const boosterUsers = [];
			const noChannelBoosters = [];
			const boosterMembers = message.guild.roles.cache.get(boosterRoleId)?.members.map(m => m.user) || [];

			for (const user of boosterMembers) {
				const userChannel = await checkisland(user.id, message.guild.id);
				boosterUsers.push({ userId: user.id, channel: userChannel?.channel });

				if (!userChannel?.channel) {
					noChannelBoosters.push(`<@!${user.id}>`);
				}
			}

			const boosterChannels = [];
			const channelsWithoutBoosters = [];
			let channelsList = "";

			const categoryChannels = message.guild.channels.cache.filter(channel =>
				channel.parentId === boosterCategoryId && channel.id !== excludedChannelId
			);

			for (const channel of categoryChannels.values()) {
				boosterChannels.push(channel.id);
				channelsList += `\n> <#${channel.id}>`;

				const channelData = await getisland(channel.id);
				const ownerId = channelData?.user;

				if (!ownerId) {
					channelsWithoutBoosters.push(`<#${channel.id}>`);
					continue;
				}

				const ownerMember = await message.guild.members.fetch(ownerId).catch(() => null);
				if (!ownerMember || !ownerMember.roles.cache.has(boosterRoleId)) {
					channelsWithoutBoosters.push(`<#${channel.id}>`);
				}
			}

			const noChannelList = noChannelBoosters.length
				? noChannelBoosters.join("\n")
				: "> All boosters have channels";

			const orphanChannelsList = channelsWithoutBoosters.length
				? channelsWithoutBoosters.join("\n")
				: "> All channels have valid boosters";

			const allChannelsList = channelsList || "> No channels found in booster category";

			const embed = new EmbedBuilder()
				.setTitle("Staff Channel Manager: Booster Channels")
				.setDescription("Boosters and Their Channels. Use `ep upgrade` to resolve issues.")
				.addFields(
					{ name: "__Channels Without Boosters__", value: orphanChannelsList, inline: true },
					{ name: "__Boosters Without Channels__", value: noChannelList, inline: true },
					{ name: "__All Booster Channels__", value: allChannelsList, inline: false }
				)
				.setColor("#097969");

			// Delete the initial notification and send the final embed
			await notificationMessage.delete();
			await message.reply({ embeds: [embed] });
		} catch (err) {
			console.error(err);
			await message.reply("An error occurred while processing the command. Please check logs.");
		}
	},
});