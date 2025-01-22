import {
	Message,
	TextChannel,
	ChannelType,
	EmbedBuilder,
	ButtonStyle,
	ButtonBuilder,
	ActionRowBuilder,
	GuildMember,
} from "discord.js";
import { PrefixCommand } from "../../handler";
import { resolveUserOrRole } from "../../handler/utils/resolveUserOrRole";
const { getisland, bannedusers, addedusers } = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
	name: "recover",
	aliases: ["Recover", "rch", "rc"],
	allowedGuilds: ['1135995107842195550'],
	allowedRoles: ["1148992217202040942"],
	optionalAllowedCategories: ["1140190313915371530"],
	optionalAllowedChannels: ["1168412438069256244", "1147233774938107966", "1138531756878864434", "1151411404071518228"],
	async execute(message: Message): Promise<void> {
		try {
			const guild = message.guild;
			if (!guild) {
				await message.reply("This command can only be used in a server.");
				return;
			}

			const channelName = message.mentions.channels.first();
			if (!channelName) {
				await message.reply("You must specify a valid channel including the #.");
				return;
			}

			const channelId = channelName.id;
			const chrole = '1147864509344661644';
			const baseParent = '1147909200924643349';

			const channelInfo = await getisland(channelId);
			if (!channelInfo) {
				await message.reply("Channel information could not be retrieved.");
				return;
			}

			const confirmEmbed = new EmbedBuilder()
				.setTitle("Staff Channel Manager: Quarantine Channel")
				.setDescription(
					`Recovering a channel restores added and banned users. It will be moved to the base category. Confirm below.`
				)
				.setColor('#097969');

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId("confirm_rc")
					.setLabel("Confirm")
					.setStyle(ButtonStyle.Primary)
					.setEmoji("✅"),
				new ButtonBuilder()
					.setCustomId("cancel_rc")
					.setLabel("Cancel")
					.setStyle(ButtonStyle.Danger)
					.setEmoji("✖️")
			);

			const confirmationMessage = await message.reply({ embeds: [confirmEmbed], components: [row] });

			const filter = (interaction: any) =>
				interaction.user.id === message.author.id &&
				(interaction.customId === "confirm_rc" || interaction.customId === "cancel_rc");

			const collector = confirmationMessage.createMessageComponentCollector({
				filter,
				time: 60000,
			});

			collector.on("collect", async (interaction) => {
				try {
					if (interaction.customId === "cancel_rc") {
						await interaction.update({
							embeds: [
								new EmbedBuilder()
									.setTitle("Staff Channel Manager: Operation Canceled")
									.setDescription(`The recovery operation has been canceled.`)
									.setColor('#FF0000'),
							],
							components: [],
						});
						collector.stop();
						return;
					}

					// Update the message to indicate processing
					await interaction.update({
						embeds: [
							new EmbedBuilder()
								.setTitle("Staff Channel Manager: Processing Request")
								.setDescription("The bot is processing your request. Please wait...")
								.setColor('#097969'),
						],
						components: [],
					});

					const startTime = Date.now();
					console.log(`Starting recovery process for channel ${channelId}`);

					// Channel recovery logic
					const userId = `${channelInfo.user}`;
					const banlist = await bannedusers(channelId);
					const addedlist = await addedusers(channelId);

					console.log(`Total banned users: ${banlist.length}`);
					console.log(`Total added users: ${addedlist.length}`);

					const getName = await guild.channels.fetch(channelId);
					if (!getName || getName.type !== ChannelType.GuildText) {
						await interaction.followUp({
							content: "Specified channel is invalid or not found.",
							ephemeral: true,
						});
						return;
					}

					const channel = getName as TextChannel;
					await channel.setParent(baseParent, { reason: "Recover channel" });
					await channel.lockPermissions();

					console.log("Processing banned users...");
					const invalidBannedUsers: string[] = [];
					for (const banned of banlist) {
						if (banned?.user) {
							const resolved = await resolveUserOrRole(guild, banned.user);
							if (resolved) {
								try {
									await channel.permissionOverwrites.edit(banned.user, {
										ViewChannel: false,
										SendMessages: false,
									});
									console.log(`Banned user processed: ${banned.user}`);
								} catch (error) {
									console.warn(`Failed to set permissions for banned user ${banned.user}:`, error || error);
								}
							} else {
								invalidBannedUsers.push(banned.user);
								console.warn(`Failed to resolve banned user ${banned.user}`);
							}
						}
					}

					console.log("Processing added users...");
					const invalidAddedUsers: string[] = [];
					for (const added of addedlist) {
						if (added?.user) {
							const resolved = await resolveUserOrRole(guild, added.user);
							if (resolved) {
								try {
									await channel.permissionOverwrites.edit(added.user, {
										ViewChannel: true,
										SendMessages: true,
									});
									console.log(`Added user processed: ${added.user}`);
								} catch (error) {
									console.warn(`Failed to set permissions for added user ${added.user}:`, error || error);
								}
							} else {
								invalidAddedUsers.push(added.user);
								console.warn(`Failed to resolve added user ${added.user}`);
							}
						}
					}

					if (invalidBannedUsers.length || invalidAddedUsers.length) {
						console.warn(
							`The following users could not be processed:\nBanned: ${invalidBannedUsers.join(", ")}\nAdded: ${invalidAddedUsers.join(", ")}`
						);
					}
					const endTime = Date.now();
					const duration = (endTime - startTime) / 1000;

					await interaction.followUp({
						content: `Channel recovery process is complete! Total time: ${duration.toFixed(2)} seconds.`,
						ephemeral: true,
					});

					console.log(`Recovery process for channel ${channelId} completed in ${duration.toFixed(2)} seconds.`);
					collector.stop();
				} catch (error) {
					console.error("Error during interaction collection:", error);

					try {
						await interaction.followUp({
							content: "An error occurred during the recovery process. Please try again later.",
							ephemeral: true,
						});
					} catch (followUpError) {
						console.error("Failed to send follow-up message:", followUpError);
					}
				}
			});

			collector.on("end", (_, reason) => {
				if (reason === "time") {
					console.warn("Collector timed out.");
					confirmationMessage.edit({
						embeds: [
							confirmEmbed.setDescription("The confirmation request has timed out."),
						],
						components: [],
					}).catch(console.error);
				} else {
					console.log("Collector ended for reason:", reason);
				}
			});
		} catch (err) {
			console.error("An error occurred during execution:", err);
		}
	},
});