import { PrefixCommand } from '../../handler';
import { EmbedBuilder, Message, TextChannel } from 'discord.js';
const { saveOrUpdateEternityProfile, getEternityProfile } = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
  name: 'eternal-flameset',
  aliases: ['flameset', 'eflameset'],

  async execute(message: Message): Promise<void> {
    const userId = message.author.id;
    const guildId = message.guild!.id;
    const channel = message.channel;

    const args = message.content.trim().split(/\s+/).slice(1); // Manual args split

    if (!args.length) {
      await message.reply('❌ Please provide the number of Eternity Flames. Example: `!eternal-flameset 150`');
      return;
    }

    const flames = parseInt(args[0].replace(/,/g, ''));
    if (isNaN(flames) || flames < 0) {
      await message.reply('❌ Invalid flame amount. Please enter a valid positive number.');
      return;
    }

    const currentProfile = await getEternityProfile(userId, guildId);

    if (currentProfile) {
      await saveOrUpdateEternityProfile(userId, guildId, currentProfile.current_eternality, flames);
    } else {
      await saveOrUpdateEternityProfile(userId, guildId, 0, flames);
    }

    const embed = new EmbedBuilder()
      .setTitle('🔥 Eternity Flames Updated!')
      .setDescription(`You now have **${flames.toLocaleString()}** Eternity Flames stored.`)
      .setColor('#ff6600')
      .setFooter({ text: 'Use !eternal profile to view your full Eternity stats.' })
      .setTimestamp();

    if (channel.isTextBased() && channel instanceof TextChannel) {
      await channel.send({ embeds: [embed] });
    }
  }
});