import { Message, EmbedBuilder, TextChannel, NewsChannel, ThreadChannel, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } from "discord.js";
import { PrefixCommand } from "../../handler";
import defaultConfig from "../../config"; // ✅ Correct import for prefix fetching

// Cache embeds for performance
const embedCache = new Map<string, EmbedBuilder[]>();

function createHelpEmbeds(type: string, prefix: string): EmbedBuilder[] {
	// ✅ Ensure we cache user and staff help separately
	const cacheKey = `${type}_${prefix}`;
	if (embedCache.has(cacheKey)) return embedCache.get(cacheKey)!;

	const userEmbeds: EmbedBuilder[] = [
		new EmbedBuilder()
			.setTitle("Parkman Help: Channel Commands")
			.setColor("#097969")
			.setDescription(`Commands in this server start with \`${prefix} <command>\`. \n\n Staff Commands found with \`${prefix} help staff\``)
			.setFooter({ text: "Select a topic to continue." }),

		new EmbedBuilder()
			.setTitle("Parkman Help Menu: All Users")
			.setAuthor({ name: "🧩 All Server User Parkman Commands" })
			.setColor("#097969")
			.setDescription(`Parkman commands all start with \`${prefix} <commandName>\`.`)
			.addFields(
				{ name: "➡ Channel Favorites List", value: "> favs, chanfav, ch, chfav, fav", inline: false },
				{ name: "➡ Add Channel Favorites", value: "> addfav, Addfav", inline: false },
				{ name: "➡ Remove Channel Favorites", value: "> removefav, Remfav", inline: false },
        { name: "➡ Eternal Profile (Epic Park Only)", value: "> et, eternal", inline: false },
        { name: "➡ Eternal Predictor (Epic Park Only)", value: "> et help, eternal help", inline: false },
        { name: "➡ Use AI Chat (Epic Park Only)", value: "> ai, askai, askme, ask", inline: false },
				{ name: "➡ Use AI Image Maker (Epic Park Only)", value: "> makeimage, mi", inline: false },
				{ name: "➡ List My Commands", value: "> commands, cm, mycommand, cmd, cmds, mc", inline: false },
				{ name: "➡ Server Emojis", value: "> emojis, emojilist, allemojis", inline: false },
				{ name: "➡ Gratitude Scoreboard", value: "> score, scores, myscore, ms", inline: false },
				{ name: "➡ Give Love", value: "> love, loves, gl, givelove", inline: false },
				{ name: "➡ Give Hugs", value: "> hug, Hug, hugs, gh", inline: false },
				{ name: "➡ Give Thanks", value: "> thanks, thank, thankyou, ty", inline: false },
				{ name: "➡ Give Bonks", value: "> Bonks, bonk, bonkyou, by", inline: false }
			),
		new EmbedBuilder()
			.setTitle("Parkman Help Menu: Server Games")
			.setAuthor({ name: "🧩 Parkman Server Games" })
			.setColor("#097969")
			.setDescription(`Parkman commands all start with \`${prefix} <commandName>\`.`)
			.addFields(
				{ name: `➡ Split Steal \`${prefix}\`ss help\``, value: "> ss, ss-nocoin", inline: false },
			),

		new EmbedBuilder()
			.setTitle("Parkman Help Menu: Arena List")
			.setAuthor({ name: "🧩 Parkman Arena List" })
			.setColor("#097969")
			.setDescription(`Parkman commands all start with \`${prefix} <commandName>\`.`)
			.addFields(
				{ name: "➡ Join Arena List", value: "> join", inline: false },
				{ name: "➡ Leave Arena List", value: "> leave", inline: false },
				{ name: "➡ View Arena List", value: "> list", inline: false },
				{ name: "➡ Reset Arena List (Staff Only)", value: "> reset", inline: false },
			),

		new EmbedBuilder()
			.setTitle("Parkman Help: Channel Commands")
			.setAuthor({ name: "🧩 Channel Owner - Permissions" })
			.setColor("#097969")
			.setDescription(`Parkman commands all start with \`${prefix} <commandName>\`.`)
			.addFields(
				{ name: "➡ Channel Information", value: "> info, channelinfo, chinfo, Info", inline: false },
				{ name: "➡ Make Channel Private", value: "> hide", inline: false },
				{ name: "➡ Make Channel Public", value: "> unhide", inline: false },
				{ name: "➡ Lock Channel (public view, messages allowed from added users)", value: "> lock", inline: false },
				{ name: "➡ UnLock Channel (Make Public)", value: "> unlock", inline: false },
				{ name: "➡ Add User To Channel", value: "> useradd, adduser, Adduser, au", inline: false },
				{ name: "➡ Ban bot/user from channel (cant see when public)", value: "> ban, Ban", inline: false },
				{ name: "➡ Remove user from channel (can see when public)", value: "> removeuser, Removeuser, remuser, rem", inline: false },
				{ name: "➡ Add Channel Co-owner", value: "> addcowner, Addcowner, addowner, addco", inline: false },
				{ name: "➡ Remove Channel Co-owner", value: "> removeco, removecowner, rmco, remoco", inline: false },
			),

		new EmbedBuilder()
			.setTitle("Parkman Help: Channel Commands")
			.setAuthor({ name: "🧩 Channel Owner - Channel Features " })
			.setColor("#097969")
			.setDescription(`Parkman commands all start with \`${prefix} <commandName>\`.`)
			.addFields(
				{ name: "➡ Pin Message", value: "> pin, pinn, Pin", inline: false },
				{ name: "➡ Remove Pin", value: "> unpin, Unpin, removepin", inline: false },
				{ name: "➡ Enable Events", value: "> events, enableevents, ee, event", inline: false },
				{ name: "➡ Disable Events", value: "> noevents, disableevents, de, disableevent", inline: false },
				{ name: "➡ Slowmode", value: "> slowmode", inline: false },
				{ name: "➡ Message delete", value: "> clear", inline: false },
				{ name: "➡ Change Channel Name", value: "> name", inline: false },
				{ name: "➡ Change Channel Description", value: "> desc", inline: false },
				{ name: "➡ Channel Upgrade (Epic Park Only)", value: "> upgrade", inline: false },
			),
		];
	const staffEmbeds: EmbedBuilder[] = [
		new EmbedBuilder()
			.setTitle("Parkman Help: Staff Commands")
			.setColor("#097969")
			.setDescription(`Commands in this server start with \`${prefix} <command>\`. \n\n User Commands found with \`${prefix} help\``)
			.setFooter({ text: "Select a topic to continue." }
			),

		new EmbedBuilder()
			.setTitle("Parkman Help: Staff Commands ")
			.setAuthor({ name: "🧩 Staff Channel Management" })
			.setColor("#097969")
			.setDescription(`Parkman commands all start with \`${prefix} <commandName>\`.`)
			.addFields(
				{ name: "➡ Detailed User Information", value: "> userinfo, ui, chaninfo", inline: false },
				{ name: "➡ Channel Quarantine (Epic Park Only)", value: "> quarantine, Quarantine, qch", inline: false },
				{ name: "➡ Channel Recover (Epic Park Only)", value: "> recover, Recover, rch, rc", inline: false },
				{ name: "➡ Channel Unassign (unrecoverable settings, channel exists)", value: "> unassign, uc, uch", inline: false },
				{ name: "➡ Channel Assign / Re-Assign", value: "> assign, Assign, ac, assignchannel, assignch", inline: false },
				{ name: "➡ Channel List", value: "> channellist, Channellist, cl", inline: false },
				{ name: "➡ Channel Audit", value: "> audit, ac, auditchannels", inline: false },
				{ name: "➡ Booster Check (Epic Park Only)", value: "> boostercheck, bc, boosts", inline: false },

			),

		new EmbedBuilder()
			.setTitle("Parkman Help: Staff Commands ")
			.setAuthor({ name: "🧩 Staff Server Management" })
			.setColor("#097969")
			.setDescription(`Parkman commands all start with \`${prefix} <commandName>\`.`)
			.addFields(
				{ name: "➡ User Information", value: "> userinfo, ui, chaninfo", inline: false },
				{ name: "➡ Role Check", value: "> rolecheck", inline: false },
				{ name: "➡ Server Ban", value: "> serverban, banserver, sb, bs", inline: false },
				{ name: "➡ Remove Server Ban", value: "> removeserverban, ub, rsb, ubuser, usb, sub", inline: false },
				{ name: "➡ Kick Users", value: "> kickuser, ku, userkick", inline: false },
			),

		new EmbedBuilder()
			.setTitle("Parkman Help: Time Travel Verification ")
			.setAuthor({ name: "🧩 Staff Time Travel Verification" })
			.setColor("#097969")
			.setDescription(`Parkman commands all start with \`${prefix} <commandName>\`.`)
			.addFields(
				{ name: "➡ Help Menu", value: "> tt", inline: false },
			),
		];

	const pages = type === "staff" ? staffEmbeds : userEmbeds;

	// ✅ Fix: Ensure each embed has the correct footer format
	pages.forEach((embed, index) => {
		embed.setFooter({ text: `Page ${index + 1} / ${pages.length}` }); // ✅ Ensures footer is an object
	});

	embedCache.set(cacheKey, pages);
	return pages;
}

// ✅ Correct Export Syntax for `PrefixCommand`
export default new PrefixCommand({
	name: "help",
	aliases: ["halp", "parkmanhelp", "Help"],

	async execute(message: Message): Promise<void> {
		try {
			console.log(`[HELP COMMAND] Executed by ${message.author.tag}`);

			const guildId = message.guild?.id || "default"; // Get guild ID or fallback
			const prefix = defaultConfig.getPrefix(guildId)

			let commandArgs = message.content.trim().toLowerCase();
			let isStaffHelp = /help\s+staff$/.test(commandArgs); // ✅ Properly detect "help staff"

			// ✅ Generate only relevant embeds
			let embeds = createHelpEmbeds(isStaffHelp ? "staff" : "user", prefix);

			// ✅ FIX: Ensure `send()` is only called on text-based channels
			if (message.channel?.isTextBased() && "send" in message.channel) {
				const textChannel = message.channel as TextChannel | NewsChannel | ThreadChannel;

				let currentPage = 0;

				// ✅ Fix: Create a Select Menu using Embed Author Names
				const selectMenu = new StringSelectMenuBuilder()
					.setCustomId("help_menu")
					.setPlaceholder(`📖 Select a help topic for prefix: ${prefix}`)
					.addOptions(
						embeds.map((embed, index) => {
							const authorName = embed.data.author?.name || `Help Topic ${index + 1}`;
							return new StringSelectMenuOptionBuilder()
								.setLabel(authorName)
								.setValue(index.toString());
						})
					);

				const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

				const sentMessage = await textChannel.send({
					embeds: [embeds[currentPage]], // Show only the first introduction page
					components: [row]
				});

				// ✅ Interaction collector for Select Menu
				const collector = sentMessage.createMessageComponentCollector({
					componentType: ComponentType.StringSelect,
					time: 600000
				});

				collector.on("collect", async (interaction) => {
					if (interaction.user.id !== message.author.id) {
						await interaction.reply({ content: "❌ Only the command sender can use this menu.", ephemeral: true });
						return;
					}

					const selectedIndex = parseInt(interaction.values[0]);

					await interaction.update({
						embeds: [embeds[selectedIndex]], // Show the selected topic
						components: [row]
					});
				});

				collector.on("end", async () => {
					await sentMessage.edit({
						components: [] // Remove select menu when interaction expires
					});
				});
			} else {
				console.error(`[ERROR] Help Command Failed: Cannot send message in this channel type.`);
				await message.author.send("⚠️ This command cannot be used in this type of channel.");
			}
		} catch (err) {
			console.error(`[ERROR] Help Command Failed:`, err);
			await message.author.send("⚠️ An error occurred while processing your request.");
		}
	}
});