const { Message, EmbedBuilder } = require('discord.js');
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";

export = {
    name: "emojis",
    aliases: ["emojilist", "allemojis"],
    type: CommandTypes.PrefixCommand,
    // 1113339391419625572 - Epic Wonderland
    // 801822272113082389 - Epic
    // 1135995107842195550 - Epic Park
    guildWhitelist: ['1135995107842195550', '1113339391419625572'],
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1147864509344661644','807811542057222176',
                    '1113407924409221120'],//epic wonderland staff
    async execute(message: typeof Message): Promise<void> {
	try{
        async function chunkArray(array, size) {
            let chunks = [];
            for (let i = 0; i < array.length; i+= size) {
                const chunk = array.slice(i, i + size);
                chunks.push(chunk);
            }

            return chunks;
        }

        async function send (chunked) {
            var intResponse;
            await chunked.forEach(async emoji => {
                if (intResponse == 1) {
                    embed.setDescription(emoji.join(' ')).setTitle(' ');
                    await message.channel.send({ embeds: [embed] });
                } else {
                    intResponse = 1;
                    var total = cache.size;
                    var animated = cache.filter(emoji => emoji.animated).size;
                    embed
                    .setTitle(`${total - animated} Regular, ${animated} Animated, ${total} Total`)
                    .setDescription(emoji.join(' '));

                    await message.reply({ embeds: [embed] });
                }
            });
        }

        var emojis = [];
        var cache = await message.guild.emojis.fetch();

        await cache.forEach(async emoji => {
            if (emoji.animated) {
                emojis.push(`<a:${emoji.name}:${emoji.id}>`);
            } else {
                emojis.push(`<:${emoji.name}:${emoji.id}>`)
            }
        });

        var chunked = await chunkArray(emojis, 50);

        const embed = new EmbedBuilder()
        .setColor("Blurple")

        var redo;
        await chunked.forEach(async chunk => {
            if (chunk.join(' ').length > 2000) redo = true;
            else redo = false;
        });

        if (redo) {
            var newChunk = await chunkArray(emojis, 20);
            send(newChunk);
        } else {
            send(chunked);
        }

	}catch(err)
        {console.log(err)}
    },
} as PrefixCommandModule;
