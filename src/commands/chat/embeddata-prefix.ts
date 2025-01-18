const { Message, AttachmentBuilder} = require('discord.js');
import { PrefixCommand } from '../../handler';
const fs = require('fs');

export default new PrefixCommand({
    name: "embedview",
    aliases: ["ev", "embedcheck"],
	// 1113339391419625572 - Epic Wonderland
	// 1135995107842195550 - Epic Park
	// 839731097473908767 - Blackstone
	allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767'],
	allowedRoles: ['1147864509344661644', '1148992217202040942','1147864509344661644','807811542057222176',
					'1113407924409221120', // epic wonderland staff],
					'845499229429956628', // Blackstone Staff
					'839731097633423389' // Blackstone Users
			],
    async execute(message: typeof Message): Promise<void> {
	try{
		let stringContent = message.content.toString()
        let ids = stringContent.split(">")
		let channel = message.mentions.channels.first()
		let channelID = channel.id
		if(!(channel)) {
			message.reply("format is `ep ev #channelname messageID`")
				return
		}
		if(!(ids)) {
			message.reply("format is `ep ev #channelname messageID`")
				return
		}
		const messageChannel = message.guild.channels.cache.get(channelID)
        const getmessage = await messageChannel.messages.fetch(ids[1])
        const embedfull = getmessage.embeds[0]
		var out = [];
		Object.entries(embedfull).forEach(itm=>out.push({key: itm[0], value: itm[1]}));

		await message.reply({
                content: `Here's your embed`,
                files: [new AttachmentBuilder(Buffer.from(JSON.stringify(out)), { name: 'embed.txt' })],
		});

	}catch(err)
        {console.log(err)}
    },
});
