import { Message, EmbedBuilder, ActionRowBuilder, MessageActionRowComponentBuilder, SelectMenuBuilder, SelectMenuInteraction, ComponentType } from "discord.js";
import { PrefixCommand } from '../../handler';
import config from '../../config';  // Ensure config contains getPrefix function

export default new PrefixCommand({
	name: "help",
	aliases: ["halp", "parkmanhelp", "Help"],
	async execute(message: Message): Promise<void> {
		try {
			// Get the dynamic prefix for the server, default to "ep"
			const prefix = message.guild ? config.getPrefix?.(message.guild.id) ?? 'ep' : 'ep';

			const userPages = [
				new EmbedBuilder()
					.setTitle(`Parkman Help Menu: Channel Commands & General Commands`)
					.setAuthor({ name: `🧩 Parkman Commands` })
					.setFooter({ text: `🧩 Parkman Help` })
					.setColor(`#097969`)
					.setDescription(`Parkman commands all start with \`${prefix} <commandName>\`\n\nChannel command availability is based on Server Availability.\n\nStaff specific commands are found in \`${prefix} help staff\`.`)
					.addFields(
						{ name: "➡ Channel Favorites List", value: `> ${prefix} favs, chanfav, ch, chfav, fav`, inline: false },
						{ name: "➡ Add Channel Favorites", value: `> ${prefix} addfav, Addfav`, inline: false },
						{ name: "➡ Remove Channel Favorites", value: `> ${prefix} removefav, remfav`, inline: false },
						{ name: "➡ Use AI Chat (Epic Park Only)", value: `> ${prefix} ai, askai, askme, ask`, inline: false },
						{ name: "➡ Use AI Image Maker (Epic Park Only)", value: `> ${prefix} makeimage, mi`, inline: false },
						{ name: "➡ Server Emojis", value: `> ${prefix} emojis, emojilist, allemojis`, inline: false },
						{ name: "➡ Gratitude Scoreboard", value: `> ${prefix} score, scores, myscore, ms`, inline: false },
						{ name: "➡ Give Love", value: `> ${prefix} love, loves, gl, givelove`, inline: false },
						{ name: "➡ Give Hugs", value: `> ${prefix} hug, hugs, gh`, inline: false },
						{ name: "➡ Give Thanks", value: `> ${prefix} thanks, thank, thankyou, ty`, inline: false },
						{ name: "➡ Give Bonks", value: `> ${prefix} bonk, bonkyou, by`, inline: false },
						{ name: "➡ Join/Leave Server Boosted Arena List", value: `> ${prefix} join or leave`, inline: false },
						{ name: "➡ List Current Boosted Arena Players", value: `> ${prefix} list, al`, inline: false },
						{ name: "➡ List Current Commands", value: `> ${prefix} commands, cm, mycommand, cmd, cmds, mc` }
					),
			];

			// Repeat this process for all embed pages by replacing 'ep' with `${prefix}` dynamically

			const selectMenu = new SelectMenuBuilder()
				.setCustomId('helpMenu')
				.setPlaceholder('Select a help category')
				.addOptions(
					{ label: 'User Commands - General', value: 'userPage1' },
					{ label: 'Channel Commands - Channel management', value: 'userPage2' },
					{ label: 'Channel Commands - User Management', value: 'userPage3' },
					{ label: 'Game Play Commands - Arena list etc.', value: 'userPage4' },
					{ label: 'Staff Commands - Channel Management', value: 'staffPage1' },
					{ label: 'Staff Commands - User Management', value: 'staffPage2' },
					{ label: 'Staff Commands - Server Management', value: 'staffPage3' }
				);

			const row = new ActionRowBuilder<MessageActionRowComponentBuilder>()
				.addComponents(selectMenu);

			const helpMessage = await message.reply({
				content: 'Please select a category:',
				components: [row]
			});

			const collector = helpMessage.createMessageComponentCollector({
				componentType: ComponentType.SelectMenu,
				time: 600000
			});

			collector.on('collect', async (interaction: SelectMenuInteraction) => {
				if (!interaction.isSelectMenu()) return;

				const selected = interaction.values[0];
				let embed: EmbedBuilder | undefined;

				switch (selected) {
					case 'userPage1':
						embed = userPages[0];
						break;
					case 'userPage2':
						embed = userPages[1];
						break;
					case 'userPage3':
						embed = userPages[2];
						break;
					case 'userPage4':
						embed = userPages[3];
						break;
					case 'staffPage1':
						embed = userPages[4];
						break;
					case 'staffPage2':
						embed = userPages[5];
						break;
					case 'staffPage3':
						embed = userPages[6];
						break;
				}

				if (embed) {
					await interaction.update({ embeds: [embed], components: [row] });
				}
			});

			collector.on('end', () => {
				helpMessage.edit({ components: [] });
			});

		} catch (err) {
			console.log(err);
		}
	}
});