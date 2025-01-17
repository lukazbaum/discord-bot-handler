import { GuildChannel, DiscordAPIError, GuildMember, ChannelType, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { getislands } = require('/home/ubuntu/ep_bot/extras/functions');

export = {
	name: "channellist",
	aliases: ["Channellist", "cl"],
	type: CommandTypes.PrefixCommand,
	// 1113339391419625572 - Epic Wonderland
	// 1135995107842195550 - Epic Park
	// 839731097473908767 - Blackstone
	guildWhitelist: ['1135995107842195550','1113339391419625572', '839731097473908767'],
	roleWhitelist: ["1148992217202040942", "807826290295570432", "1073788272452579359", "1113407924409221120",
					"1306823330271330345",
					'845499229429956628', // Blackstone Staff
		],

	optionalChannelWhitelist: ["1142401741866946702", "1147233774938107966", "1138531756878864434",
							"1151411404071518228", "1142401741866946702", "1158570345100488754"],
	optionalCategoryWhitelist: ["1137072690264551604", "1203928376205905960", "1152037896841351258",
								"1113414355669753907",
								"839731098456293420", // blackstone staff land
		],

	async execute(message: Message): Promise<void> {
		try {
			if (message.channel.type !== ChannelType.GuildText) return;
			const allChannels = await getislands();
			const serverId = message.guild.id;

			const serverList: { [key: string]: string } = {
				'1135995107842195550': '1135995107842195550',
				'1113339391419625572': '1113339391419625572',
				'839731097473908767' : '839731097473908767',
			};

			const serverSelect = Object.entries(serverList).find(([key]) => key === serverId)?.[1];
			if (!serverSelect) {
				await message.reply("This server is not in the whitelist.");
				return;
			}

			const channels = allChannels.filter(
				(ch: any) => `${ch.server}` === serverSelect && `${ch.user}` !== '1151325182351392818'
			);

			if (!channels.length) {
				await message.reply("No channels found for this server.");
				return;
			}

			// setup pagination

			const PAGE_SIZE = 15;
			let page = 0;

			const createEmbed = (page: number) => {
				const paginatedChannels = channels.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
				const embed = new EmbedBuilder()
					.setTitle("Server Channel List")
					.setDescription(
						paginatedChannels
							.map((ch: any, index: number) => `> ${index + 1 + page * PAGE_SIZE}. <@!${ch.user}> owns: <#${ch.channel}>`)
							.join("\n")
					)
					.setFooter({ text: `Page ${page + 1} of ${Math.ceil(channels.length / PAGE_SIZE)}` });

				return embed;
			};

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder().setCustomId('previous').setLabel('◀️').setStyle(ButtonStyle.Primary).setDisabled(true),
				new ButtonBuilder().setCustomId('nextpage').setLabel('▶️').setStyle(ButtonStyle.Primary).setDisabled(channels.length <= PAGE_SIZE)
			);

			const msg = await message.channel.send({
				embeds: [createEmbed(page)],
				components: [row]
			});

			const collector = msg.createMessageComponentCollector({ time: 5 * 60 * 1000 });

			collector.on('collect', async (interaction) => {
				if (!interaction.isButton()) return;
				try {
					await interaction.deferUpdate();
					if (interaction.customId === 'previous' && page > 0) {
						page--;
					} else if (interaction.customId === 'nextpage' && (page + 1) * PAGE_SIZE < channels.length) {
						page++;
					}

					await interaction.editReply({
						embeds: [createEmbed(page)],
						components: [
							new ActionRowBuilder<ButtonBuilder>().addComponents(
								new ButtonBuilder().setCustomId('previous').setLabel('◀️').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
								new ButtonBuilder().setCustomId('nextpage').setLabel('▶️').setStyle(ButtonStyle.Primary).setDisabled((page + 1) * PAGE_SIZE >= channels.length)
							)
						],
					});
				} catch (err) {
					if (err instanceof DiscordAPIError) {
						if (err.code === 10062) {
							console.warn('interaction expired for channel list')
						} else {
							console.error('failed to update channel list interaction', err)
						}
					} else {
						console.error('unknown error: ', err);
					}
				}
			});

			collector.on('end', async () => {
				try {
					await msg.edit({
						components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder().setCustomId('previous').setLabel('◀️').setStyle(ButtonStyle.Primary).setDisabled(true),
							new ButtonBuilder().setCustomId('nextpage').setLabel('▶️').setStyle(ButtonStyle.Primary).setDisabled(true)
						)],
					});
				} catch (err) {
					console.error('Failed to edit message on collector end: ', err);
				}
			});

			} catch (err) {
			console.error(err);
			await message.reply("An error occurred while fetching the channel list.");
		}
	}
} as PrefixCommandModule;