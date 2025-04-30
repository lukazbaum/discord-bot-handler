import { TextChannel, Message, ChannelType, EmbedBuilder } from "discord.js";
import { PrefixCommand } from '../../handler';
const { updateGuildBan } = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
	name: "removeserverban",
	aliases: ["ub", "rsb", "ubuser", "usb", "sub"],
	// 871269916085452870 - Luminescent
	allowedGuilds: ['1135995107842195550', '1113339391419625572', '839731097473908767','871269916085452870'],
	allowedRoles: [
		"1148992217202040942", // Epic Park Staff
		"1113414355669753907", // Epic Wonderland Admin
		"1113407924409221120", // Epic Wonderland Staff
		"845499229429956628",  // Blackstone Staff
		'871393325389844521', // Luminescent Leiutenint

	],
	async execute(message: Message): Promise<void> {
		try {
			if (message.channel.type !== ChannelType.GuildText) return;

			const messageContent = message.content.split(" ");
			const userInput = messageContent[2]; // First argument after the command
			const reason = messageContent.slice(3).join(" ") || "No reason supplied"; // Everything after user input
			const serverId = message.guild?.id;

			let userId: string | undefined;

			// Helper to check if the input is a valid numerical ID
			function isValidId(value: string): boolean {
				return /^\d+$/.test(value);
			}

			// Determine the user ID based on input
			if (message.mentions.users.size > 0) {
				userId = message.mentions.users.first()?.id;
			} else if (isValidId(userInput)) {
				userId = userInput; // User input is a valid numerical ID
			} else {
				await message.reply("Please provide a valid user mention or numerical user ID.");
				return;
			}

			// Check if the user is banned
			const bannedUser = await message.guild?.bans.fetch(userId).catch(() => null);

			if (!bannedUser) {
				await message.reply(`The user with ID \`${userId}\` is not currently banned on this server.`);
				return;
			}

			// Unban the user
			await message.guild.members.unban(userId, reason);

			const date = new Date().toLocaleString();

			// Update the ban record in your database or system
			await updateGuildBan(userId, 'unban', reason, message.author.id, date);

			// Create the embed log
			const embed = new EmbedBuilder()
				.setTitle("Staff Manager: Remove Server Ban")
				.setDescription(`**Action**: UnBan
                **User**: <@${userId}>
                **Reason**: ${reason}
                **Date**: ${date}
                **Removed By**: ${message.author.username}`);

			// Log the action in the appropriate channel
			const banChannelList: { [key: string]: string } = {
				"1135995107842195550": "1160751610771820554", // Epic Park
				"1113339391419625572": "1115941478007582740", // Epic Wonderland Staff
				"839731097473908767": "839731097754533897",  // Blackstone Warn Logs
			};

			const banChannelId = banChannelList[serverId!];
			const banChannel = message.guild?.channels.cache.get(banChannelId) as TextChannel;

			if (banChannel) {
				await banChannel.send({ embeds: [embed] });
			}

			// Send confirmation to the moderator
			await message.reply({ embeds: [embed] });

		} catch (err) {
			console.error(err);
			await message.reply("An error occurred while processing the command.");
		}
	},
});