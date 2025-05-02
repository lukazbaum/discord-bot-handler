const { Message, AttachmentBuilder } = require('discord.js');
import { PrefixCommand } from '../../handler';
const fs = require('fs');

export default new PrefixCommand({
	name: "embedview",
	aliases: ["ev", "embedcheck"],
	allowedGuilds: ['1135995107842195550', '1113339391419625572', '839731097473908767','871269916085452870'],
	allowedRoles: [
		'1147864509344661644', '1148992217202040942', '1147864509344661644', '807811542057222176',
		'1113407924409221120', // Epic Wonderland staff
		'845499229429956628', // Blackstone Staff
		'839731097633423389', // Blackstone Users
		"1130783135156670504", // Luminescent Users
		'871393325389844521', // Luminescent Leiutenint
	],
	async execute(message: typeof Message): Promise<void> {
		try {
			let stringContent = message.content.toString();
			let ids = stringContent.split(">");

			// Ensure a mentioned channel exists
			let channel = message.mentions.channels.first();
			if (!channel) {
				await message.reply("Format is `ep ev #channelname messageID`");
				return;
			}

			let channelID = channel.id;

			// Ensure the message ID part exists
			if (ids.length < 2 || !ids[1].trim()) {
				await message.reply("Format is `ep ev #channelname messageID`");
				return;
			}

			const messageChannel = message.guild.channels.cache.get(channelID);
			if (!messageChannel || !messageChannel.isTextBased()) {
				await message.reply("Invalid channel provided.");
				return;
			}

			const messageID = ids[1].trim();
			const fetchedMessage = await messageChannel.messages.fetch(messageID).catch(() => null);
			if (!fetchedMessage) {
				await message.reply("Could not find the specified message in the channel.");
				return;
			}

			// Ensure the message contains embeds
			const embedFull = fetchedMessage.embeds[0];
			if (!embedFull) {
				await message.reply("The specified message does not contain any embeds.");
				return;
			}

			let output = [];
			Object.entries(embedFull).forEach(([key, value]) => {
				output.push({ key, value });
			});

			await message.reply({
				content: `Here's your embed`,
				files: [new AttachmentBuilder(Buffer.from(JSON.stringify(output, null, 2)), { name: 'embed.txt' })],
			});

		} catch (err) {
			console.error(err);
			await message.reply("An error occurred while processing your request.");
		}
	},
});