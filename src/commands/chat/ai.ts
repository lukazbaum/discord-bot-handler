import { ChannelType, Message, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageActionRowComponentBuilder, ComponentType } from "discord.js";
import {PrefixCommand} from "../../handler";
const { OPENAI_API_KEY } = require('../../../../ep_bot/extras/settings');
const OpenAI = require("openai");

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
});

export default new PrefixCommand({
	name: "askai",
	aliases: ["ai", "askme", "ask"],
	allowedGuilds: ['1135995107842195550'],
	allowedCategories: ['1147909067172483162', '1147909156196593787', '1147909539413368883', '1147909373180530708', '1147909282201870406', '1147909200924643349', '1137026511921229905', '1152913513598173214', '1140512246141812806', '1140190313915371530'],
	async execute(message: Message): Promise<void> {
		try {
			if (message.channel.type !== ChannelType.GuildText) return;

			let progress_bar = await message.channel.send('Progress: =>..');
			const completion = await openai.chat.completions.create({
				model: "gpt-4o",
				messages: [
					{ role: "system", content: "Describe the desired AI characteristics, knowledge base, personality, how questions should be answered" },
					{ role: "user", content: "Who won the 2020 world series?" },
					{ role: "assistant", content: "Los Angeles Dodgers" },
					{ role: "user", content: "Where was the 2020 world series played?" },
					{ role: "assistant", content: "Texas" },
					{ role: "user", content: "Were there spectators at the 2020 world series" },
					{ role: "assistant", content: "Due to Covid Lockdowns, no spectators were at the world series" },
					{ role: "user", content: `${message.content}` },
				],
			});

			await progress_bar.edit('Progress: ====>...');
			let data = completion.choices[0]?.message?.content || "No response received.";
			let dataCompleteReason = completion.choices[0]?.finish_reason;

			// Paginate data
			const chunkSize = 2000;
			const pages = [];
			for (let i = 0; i < data.length; i += chunkSize) {
				pages.push(data.slice(i, i + chunkSize));
			}

			let currentPage = 0;

			// Create the initial embed
			const embed = new EmbedBuilder()
				.setTitle("AI Response")
				.setDescription(pages[currentPage])
				.setFooter({ text: `Page ${currentPage + 1} of ${pages.length}` });

			// Create navigation buttons
			const backButton = new ButtonBuilder()
				.setCustomId('back')
				.setLabel('◀️')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(currentPage === 0);

			const nextButton = new ButtonBuilder()
				.setCustomId('next')
				.setLabel('▶️')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(currentPage === pages.length - 1);

			const row = new ActionRowBuilder<MessageActionRowComponentBuilder>()
				.addComponents(backButton, nextButton);

			const messageEmbed = await message.channel.send({
				embeds: [embed],
				components: [row],
			});

			// Create a collector for button interactions
			const collector = messageEmbed.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 60000, // 1 minute
			});

			collector.on('collect', async (interaction) => {
				if (interaction.user.id !== message.author.id) {
					await interaction.reply({ content: "These buttons are not for you!", ephemeral: true });
					return;
				}

				if (interaction.customId === 'back') {
					currentPage = Math.max(currentPage - 1, 0);
				} else if (interaction.customId === 'next') {
					currentPage = Math.min(currentPage + 1, pages.length - 1);
				}

				// Update the embed
				embed.setDescription(pages[currentPage])
					.setFooter({ text: `Page ${currentPage + 1} of ${pages.length}` });

				// Update buttons
				backButton.setDisabled(currentPage === 0);
				nextButton.setDisabled(currentPage === pages.length - 1);
				row.setComponents(backButton, nextButton);

				await interaction.update({
					embeds: [embed],
					components: [row],
				});
			});

			collector.on('end', async () => {
				// Disable buttons after the collector ends
				backButton.setDisabled(true);
				nextButton.setDisabled(true);
				row.setComponents(backButton, nextButton);

				await messageEmbed.edit({
					components: [row],
				});
			});

			await progress_bar.edit(`Query finished`);

			if (dataCompleteReason === 'content_filter') {
				await message.reply('Response was edited or failed due to content filters.');
			}
		} catch (err) {
			console.error(err);
			// Check if the channel is a TextChannel or similar type
			if (message.channel?.type === ChannelType.GuildText || message.channel?.type === ChannelType.DM) {
				await message.channel.send('An error occurred while processing your request.');
			} else {
				console.error("The message's channel does not support sending messages.");
			}
		}
	}
});