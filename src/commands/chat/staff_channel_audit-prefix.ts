import { GuildChannel, GuildMember, ChannelType, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { getislands } = require('/home/ubuntu/ep_bot/extras/functions');

export = {
	name: "audit",
	aliases: ["ac", "auditchannels"],
	type: CommandTypes.PrefixCommand,
	guildWhitelist: ['1135995107842195550',  '1113339391419625572'],
	roleWhitelist: ["1148992217202040942", "807826290295570432", "1073788272452579359", "1113407924409221120","1306823330271330345"],
	optionalChannelWhitelist: ["1142401741866946702", "1147233774938107966", "1138531756878864434", "1151411404071518228", "1142401741866946702", "1158570345100488754", "1298446582399897621"],
	optionalCategoryWhitelist: ["1137072690264551604", "1203928376205905960", "1152037896841351258", "1113414355669753907"],

	async execute(message: Message): Promise<void> {
		try {
			if (message.channel.type !== ChannelType.GuildText) return;

			const allChannels = await getislands();
			const serverId = message.guild.id;

			const serverList: { [key: string]: string } = {
				'1135995107842195550': '1135995107842195550',
				'1113339391419625572': '1113339391419625572'
			};

			const serverSelect = Object.entries(serverList).find(([key]) => key === serverId)?.[1];
			if (!serverSelect) {
				await message.reply("This server is not in the whitelist.");
				return;
			}

			// Array of known user IDs to skip
			const knownUserIdsToSkip = ['1151325182351392818', '1234731796944650340'];

			// Fetch all guild members
			const guildMembers = await message.guild.members.fetch();
			const activeMemberIds = guildMembers.map(member => member.id);

			// Filter channels to only include those whose owners are no longer in the guild and not in knownUserIdsToSkip
			const inactiveUsers = allChannels.filter(
				(ch: any) =>
					`${ch.server}` === serverSelect &&
					!activeMemberIds.includes(`${ch.user}`) &&
					!knownUserIdsToSkip.includes(`${ch.user}`)
			);

			if (!inactiveUsers.length) {
				await message.reply("No inactive users found with channel ownership.");
				return;
			}

			const PAGE_SIZE = 15;
			let page = 0;

			const createEmbed = (page: number) => {
				const paginatedUsers = inactiveUsers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
				const embed = new EmbedBuilder()
					.setTitle("Non-Server Users with Channel Ownership")
					.setDescription(
						paginatedUsers
							.map((ch: any, index: number) => `> ${index + 1 + page * PAGE_SIZE}. <@!${ch.user}> owns: <#${ch.channel}>`)
							.join("\n")
					)
					.setFooter({ text: `Page ${page + 1} of ${Math.ceil(inactiveUsers.length / PAGE_SIZE)}` });

				return embed;
			};

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder().setCustomId('prev').setLabel('◀️').setStyle(ButtonStyle.Primary).setDisabled(true),
				new ButtonBuilder().setCustomId('next').setLabel('▶️').setStyle(ButtonStyle.Primary).setDisabled(inactiveUsers.length <= PAGE_SIZE)
			);

			const msg = await message.channel.send({
				embeds: [createEmbed(page)],
				components: [row]
			});

			const collector = msg.createMessageComponentCollector({ time: 60000 });

			collector.on('collect', async (interaction) => {
				if (!interaction.isButton()) return;

				if (interaction.customId === 'prev' && page > 0) {
					page--;
				} else if (interaction.customId === 'next' && (page + 1) * PAGE_SIZE < inactiveUsers.length) {
					page++;
				}

				await interaction.update({
					embeds: [createEmbed(page)],
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder().setCustomId('prev').setLabel('◀️').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
							new ButtonBuilder().setCustomId('next').setLabel('▶️').setStyle(ButtonStyle.Primary).setDisabled((page + 1) * PAGE_SIZE >= inactiveUsers.length)
						)
					]
				});
			});

			collector.on('end', async () => {
				await msg.edit({
					components: []
				}).catch(console.error);
			});
		} catch (err) {
			console.error(err);
			await message.reply("An error occurred while fetching the inactive user list.");
		}
	}
} as PrefixCommandModule;