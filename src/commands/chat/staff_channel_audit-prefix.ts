import {
	ChannelType,
	Message,
	EmbedBuilder,
	Client,
	TextChannel,
	NewsChannel,
	GuildBasedChannel,
	BaseGuildTextChannel,
} from "discord.js";
import { PrefixCommand } from "../../handler";
const { getislands } = require('/home/ubuntu/ep_bot/extras/functions');

// Queue to track audit requests
const auditQueue: string[] = [];
let isProcessing = false; // Global lock for queue processing

async function processQueue(client: Client, requester: Message): Promise<void> {
	if (isProcessing) {
		console.log("Queue processing already in progress.");
		return;
	}

	if (auditQueue.length === 0) {
		console.log("Audit queue is empty. Nothing to process.");
		return;
	}

	isProcessing = true; // Set lock
	const guildId = auditQueue[0]; // Get the current guild from the queue
	console.log(`Processing audit for guild: ${guildId}`);

	try {
		const guild = await client.guilds.fetch(guildId);

		// Send initial message
		if (!isValidSendChannel(requester.channel)) {
			console.error("Requester channel does not support messages.");
			return;
		}
		const initialMessage = await requester.channel.send({
			content: `🔍 Starting the audit for **${guild.name}**...`,
		});

		// Fetch all channels and filter for the current guild
		const allChannels = await getislands();
		const serverChannels = allChannels.filter((ch: any) => `${ch.server}` === guildId);

		//console.log("Filtered Channels for This Server:", serverChannels);

		// Known user IDs to skip
		const knownUserIdsToSkip = ['1151325182351392818', '1234731796944650340'];
		const inactiveUsers: any[] = [];

		console.log("Starting validation of users...");
		for (const ch of serverChannels) {
			try {
				await guild.members.fetch(ch.user); // User exists
			} catch {
				// Handle user not found
				if (!knownUserIdsToSkip.includes(ch.user)) {
					inactiveUsers.push(ch);
				}
			}
		}

		// Prepare the embed based on the results
		const embed = new EmbedBuilder()
			.setTitle("Audit Results")
			.setFooter({ text: `Guild: ${guild.name}` });

		if (!inactiveUsers.length) {
			console.log(`No inactive users found for guild: ${guildId}`);
			embed.setDescription("✅ No inactive users found with channel ownership.");
		} else {
			console.log("Inactive users found, preparing to send the embed...");
			embed.setDescription(
				inactiveUsers
					.map(
						(ch: any, index: number) =>
							`> ${index + 1}. <@!${ch.user}> left and use to own: <#${ch.channel}>`
					)
					.join("\n")
			);
		}

		// Update the initial message with the embed
		await initialMessage.edit({
			content: `✅ Audit completed for **${guild.name}**.`,
			embeds: [embed],
		});

		auditQueue.shift(); // Remove the current guild from the queue
		console.log(`Guild ${guildId} removed from queue.`);
	} catch (err) {
		console.error(`Error during audit execution for guild: ${guildId}`, err);

		if (isValidSendChannel(requester.channel)) {
			await requester.channel.send(`❌ An error occurred while auditing **${guildId}**.`);
		}
	} finally {
		isProcessing = false; // Release lock
		if (auditQueue.length > 0) {
			await processQueue(client, requester); // Process the next item
		} else {
			console.log("Queue processing completed.");
		}
	}
}

// Helper function to check if a channel is a valid Guild-based text channel
function isValidSendChannel(channel: any): channel is TextChannel | NewsChannel {
	return (
		channel.type === ChannelType.GuildText ||
		channel.type === ChannelType.GuildAnnouncement
	);
}

export default new PrefixCommand({
	name: "audit",
	aliases: ["ac", "auditchannels"],
	allowedGuilds: ['1135995107842195550', '1113339391419625572', '839731097473908767','871269916085452870'],
	allowedRoles: [
		"1148992217202040942", "807826290295570432", "1073788272452579359",
		"1113407924409221120", "1306823330271330345",
		'845499229429956628', '1113407924409221120', '845499229429956628',
		'871393325389844521', // Luminescent Leiutenint
	],
	optionalAllowedChannels: [
		"1142401741866946702", "1147233774938107966", "1138531756878864434",
		"1151411404071518228", "1158570345100488754",
		"1298446582399897621", "839731098690650117",
		"846989480748777492"
	],
	optionalAllowedCategories: [
		"1137072690264551604", "1203928376205905960", "1152037896841351258",
		"1113414355669753907", "839731098456293420",
		'1113414355669753907',// epic wonderland play land staff
		'1115772256052846632', /// epic wonderland staff
		'967657150769942578',
		'1128607975972548711',// Luminescent Staff

	],
	async execute(message: Message): Promise<void> {
		const guildId = message.guildId;
		if (!guildId) {
			await message.reply("This command can only be run in an allowed server.");
			return;
		}

		// Channel and role-based permissions check
		const channelParentId = (message.channel.type === ChannelType.GuildText || message.channel.type === ChannelType.GuildAnnouncement)
			? message.channel.parentId
			: null;

		if (
			this.allowedGuilds.includes(guildId) &&
			message.member?.roles.cache.some(role => this.allowedRoles.includes(role.id)) &&
			(
				this.optionalAllowedChannels.includes(message.channel.id) ||
				this.optionalAllowedCategories.includes(channelParentId ?? "")
			)
		) {
			if (auditQueue.includes(guildId)) {
				await message.reply("An audit is already queued for this server. Please wait until it is processed.");
				return;
			}

			auditQueue.push(guildId);
			console.log(`Guild ${guildId} added to audit queue.`);

			if (auditQueue.length === 1) {
				await processQueue(message.client, message); // Start processing if this is the only guild in the queue
			}
		} else {
			await message.reply("You do not have the required permissions or this channel is not allowed.");
		}
	}
});