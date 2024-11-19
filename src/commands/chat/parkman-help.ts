import { Message, EmbedBuilder, ActionRowBuilder, MessageActionRowComponentBuilder, SelectMenuBuilder, SelectMenuInteraction, ComponentType } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";

export = {
	name: "help",
	aliases: ["halp", "parkmanhelp", "Help"],
	type: CommandTypes.PrefixCommand,
	async execute(message: Message): Promise<void> {
		try {
			const userPages = [
				new EmbedBuilder()
					.setTitle("Parkman Help Menu: Channel Commands General Commands")
					.setAuthor({ name: `🧩 Parkman Commands` })
					.setFooter({ text: `🧩 Parkman Help` })
					.setColor(`#097969`)
					.setDescription("Parkman commands all start with `ep <commandName>`\n\nChannel command availability is based on Server Availability.\n\nStaff specific commands are found in `ep help staff`.")
					.addFields(
						{ name: "➡ Channel Favorites List", value: "> favs, chanfav, ch, chfav, fav", inline: false },
						{ name: "➡ Add Channel Favorites", value: "> addfav, Addfav", inline: false },
						{ name: "➡ Remove Channel Favorites", value: "> addfav, Addfav", inline: false },
						{ name: "➡ Use AI Chat (Epic Park Only)", value: "> ai, askai, askme, ask", inline: false },
						{ name: "➡ Use AI Image Maker (Epic Park Only)", value: "> makeimage, mi", inline: false },
						{ name: "➡ Server Emojis", value: "> emojis, emojilist, allemojis", inline: false },
						{ name: "➡ Gratitude Scoreboard", value: "> score, scores, myscore, ms", inline: false },
						{ name: "➡ Give Love", value: "> love, loves, gl, givelove", inline: false },
						{ name: "➡ Give Hugs", value: "> hug, Hug, hugs, gh", inline: false },
						{ name: "➡ Give Thanks", value: "> thanks, thank, thankyou, ty", inline: false },
						{ name: "➡ Give Bonks", value: "> Bonks, bonk, bonkyou, by", inline: false },
						{ name: "- Join/Leave Server Boosted Arena List", value: "> join or leave", inline: false },
						{ name: "- List Current Boosted Arena Players", value: "> list, al", inline: false}
					),
				new EmbedBuilder()
					.setTitle("Parkman Help: Channel Management Commands")
					.setAuthor({ name: `🧩 Channel Owner Commands` })
					.setFooter({ text: `🧩 Parkman Help` })
					.setColor(`#097969`)
					.setDescription("Parkman commands all start with `ep <commandName>`\n\n")
					.addFields(
						{ name: "➡ Channel Information", value: "> info, channelinfo, chinfo, Info", inline: false },
						{ name: "➡ Change Channel Description", value: "> desc", inline: false },
						{ name: "➡ Change Channel Name ex. `ep name # ✅ channelname`", value: "> name", inline: false },
						{ name: "➡ Upgrade Channel", value: "> upgrade, Upgrade, up", inline: false },
						{ name: "➡ Slowmode On", value: "> slowmode, smon, Slowmodeon, slowon", inline: false },
						{ name: "➡ Slowmode Off", value: "> slowmodeoff, smoff, Slowmodeoff, slowoff", inline: false },
						{ name: "➡ Message Clear", value: "> clear, Clear, delete, clear", inline: false },
						{ name: "➡ Pin Message", value: "> pin, pinn, Pin", inline: false },
						{ name: "➡ Remove Pin", value: "> unpin, Unpin, removepin", inline: false },
						{ name: "➡ Enable Events", value: "> events, enableevents, ee, event", inline: false },
						{ name: "➡ Disable Events", value: "> noevents, disableevents, de, disableevent", inline: false }
					),
				new EmbedBuilder()
					.setTitle("Parkman Help: Channel User Management")
					.setAuthor({ name: `🧩 Channel Owner Commands` })
					.setFooter({ text: `🧩 Parkman Help` })
					.setColor(`#097969`)
					.setDescription("Parkman commands all start with `ep <commandName>`\n\n")
					.addFields(
						{ name: "➡ Add User To Channel", value: "> useradd, adduser, Adduser, au", inline: false },
						{ name: "➡ Ban User/Bot From Channel", value: "> ban, Ban", inline: false },
						{ name: "➡ Remove User From Channel", value: "> removeuser, Removeuser, remuser, rem", inline: false },
						{ name: "➡ Add Channel Co-owner", value: "> addcowner, Addcowner, addowner, addco", inline: false },
						{ name: "➡ Remove Channel Co-owner", value: "> removeco, removecowner, rmco, remoco", inline: false }
					),
				new EmbedBuilder()
					.setTitle("Parkman Help: Games")
					.setAuthor({ name: `🧩 Game Play Help` })
					.setFooter({ text: `🧩 Parkman Help` })
					.setColor(`#097969`)
					.setDescription("Parkman commands all start with `ep <commandName>`\n\n")
					.addFields(
						{ name: "➡ Join Arena", value: "> join", inline: false },
						{ name: "➡ Leave Arena", value: "> leave", inline: false },
						{ name: "➡ list Arena", value: "> al, arenalist", inline: false }

					),
				new EmbedBuilder()
					.setTitle("Parkman Help: Staff Commands User Management")
					.setAuthor({ name: `🧩 Parkman Staff Help` })
					.setFooter({ text: `🧩 Parkman Help` })
					.setColor(`#097969`)
					.setDescription("Parkman commands all start with `ep <commandName>`\n\nStaff Members have access to all user commands. Commands listed here are for staff members only.\n\n>Not All Commands Are Enabled By Default")
					.addFields(
						{ name: "➡ User Information", value: "> userinfo, ui, chaninfo, Chaninfo (will take both @user & #channelname)", inline: false },
						{ name: "➡ Channel Quarantine", value: "> quarantine, Quarantine, qch", inline: false },
						{ name: "➡ Channel Recover", value: "> recover, Recover, rch, rc", inline: false },
						{ name: "➡ Channel Unassign (unrecoverable)", value: "> unassign, uc, uch", inline: false },
						{ name: "➡ Channel Assign: ex: `ep assign @user # ✅ channelname`", value: "> assign, Assign, ac, assignchannel, assignch", inline: false }
					),
				new EmbedBuilder()
					.setTitle("Parkman Help: Staff Channel Management")
					.setAuthor({ name: `🧩 Parkman Staff Help` })
					.setFooter({ text: `🧩 Parkman Help` })
					.setColor(`#097969`)
					.addFields(
						{ name: "➡ Channel List: lists all channels and their non-pinged owners", value: "> channellist, Channellist, cl", inline: false },
						{ name: "➡ Channel Audit: lists channels with owners not on the server", value: "> audit, ca, auditchannel", inline: false },
						{ name: "➡ Channel Role Check: checks a specific role's permission in channel", value: "> rolecheck", inline: false },
						{ name: "➡ Channel Clear Messages: Bulk deletes a specified amount of messages in a channel", value: "> clear, delete", inline: false },
						{ name: "➡ Channel Upgrades: moves channel to appropriate area", value: "> staffupgrade, sup, changecat", inline: false },
						{ name: "➡ Booster Channel Audit: Audits Booster Channels", value: "> boostercheck, bc, boosts", inline: false },
						{ name: "➡ Server Ban User", value: "> banserver, bs, serverban, sb", inline: false },
						{ name: "➡ Remove Server Ban", value: "> removeserverban, ub, rsb, ubuser, usb, sub", inline: false },
						{ name: "➡ Kick User", value: "> kick", inline: false }
					)
			];

			const selectMenu = new SelectMenuBuilder()
				.setCustomId('helpMenu')
				.setPlaceholder('Select a help category')
				.addOptions(
					{ label: 'User Commands - General', value: 'userPage1' },
					{ label: 'Channel Commands - Channel management', value: 'userPage2' },
					{ label: 'Channel Commands - User Management', value: 'userPage3' },
					{ label: 'Game Play Commands - Arena list etc.', value: 'userPage4' },
					{ label: 'Staff Commands - Channel Management', value: 'staffPage1' },
					{ label: 'Staff Commands - User Management', value: 'staffPage2' }
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
} as PrefixCommandModule;
