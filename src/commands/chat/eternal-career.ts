import { PrefixCommand } from '../../handler';
import { Message, EmbedBuilder, TextChannel, ThreadChannel, NewsChannel } from 'discord.js';
const { getEternityCareer } = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
  name: 'eternal-career',
  aliases: ['ecareer', 'eternitycareer'],


  async execute(message: Message): Promise<void> {
    const userId = message.author.id;
    const guildId = message.guild?.id;
    const channel = message.channel;

    if (!guildId || !(channel instanceof TextChannel || channel instanceof ThreadChannel || channel instanceof NewsChannel)) {
      await message.reply('❌ This command can only be used inside a server text channel.');
      return;
    }

    const career = await getEternityCareer(userId, guildId);

    if (!career) {
      await message.reply('❌ No Eternity career data found. Start grinding Eternal Dungeons!');
      return;
    }

    const careerEmbed = new EmbedBuilder()
      .setTitle('🏆 Eternity Career Overview')
      .setColor('#ffcc00')
      .addFields(
        { name: 'Highest Eternity', value: `${career.highest_eternity || 0}`, inline: true },
        { name: 'Total Flames Burned', value: `${career.total_flames?.toLocaleString() || '0'}`, inline: true },
        { name: 'Total Bonus TT', value: `${career.total_bonus_tt?.toLocaleString() || '0'}`, inline: true },
        { name: 'Total Unseals', value: `${career.total_unseals || 0}`, inline: true },
        { name: 'First Unseal Date', value: `${career.first_unseal_date ? new Date(career.first_unseal_date).toLocaleDateString() : 'Unknown'}`, inline: false }
      )
      .setFooter({ text: 'Eternity is forever...' });

    await message.reply({ embeds: [careerEmbed] });
  }
});