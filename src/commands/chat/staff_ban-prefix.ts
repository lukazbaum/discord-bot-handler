import { TextChannel, Message, ChannelType, EmbedBuilder } from "discord.js";
import { PrefixCommand } from '../../handler';
const { guildBan } = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
	name: "banserver",
	aliases: ["bs", "serverban", "sb"],
	allowedGuilds: ['1135995107842195550', '1113339391419625572', '839731097473908767'],
	allowedRoles: [
		"1148992217202040942", // Epic Park Staff
		"1113407924409221120", // Epic Wonderland Staff
		'845499229429956628',  // Blackstone Staff
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

			const modRoleList: { [key: string]: string } = {
				"1135995107842195550": "1148992217202040942", // Epic Park Staff
				"1113339391419625572": "1113407924409221120", // Epic Wonderland Staff
				"839731097473908767": "845499229429956628",  // Blackstone Staff
			};

			const roleId = modRoleList[serverId!];
			const executor = await message.guild?.members.fetch(message.author.id).catch(() => null);

			if (!executor?.roles.cache.has(roleId)) {
				await message.reply("Only moderators can ban users at the server level.");
				return;
			}

			// Attempt to fetch the member
			const targetMember = await message.guild?.members.fetch(userId).catch(() => null);

			if (targetMember) {
				// If the user is in the guild, check for bot or self-ban
				if (targetMember.roles.cache.has("1140520446241034290")) {
					await message.reply("You cannot ban server bots.");
					return;
				}
				if (userId === message.author.id) {
					await message.reply("You cannot ban yourself.");
					return;
				}
			} else {
				// If the user is not in the guild, inform the moderator
				await message.reply(`The user with ID \`${userId}\` is not currently in the guild but will be banned upon attempting to join.`);
			}

			const date = new Date().toLocaleString();

			// Ban the user by ID
			await guildBan(userId, 'ban', reason, message.author.id, date);
			await message.guild?.bans.create(userId, {
				deleteMessageSeconds: 60 * 60 * 24 * 7,
				reason: reason,
			});

			const embed = new EmbedBuilder()
				.setTitle("Staff Manager: Server Ban")
				.setDescription(`**Action**: Server Ban
                **User**: <@${userId}>
                **Reason**: ${reason}
                **Date**: ${date}
                **Set By**: ${message.author.username}
                **Messages Deleted**: 7 Days Worth of Messages Deleted`);

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
			await message.reply({ embeds: [embed] });
		} catch (err) {
			console.error(err);
			await message.reply("An error occurred while processing the command.");
		}
	},
});