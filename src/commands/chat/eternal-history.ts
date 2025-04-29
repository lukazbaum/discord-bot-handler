import { PrefixCommand } from '../../handler';
import { EmbedBuilder, Message } from 'discord.js';
import { paginateEmbedWithSelect } from '../../utils/paginateEmbedWithSelect';
const { getEternalUnsealHistory, getEternalDungeonWins } = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
  name: 'eternal-history',
  aliases: ['ehistory', 'eternalhistory'],

  async execute(message: Message): Promise<void> {
    const userId = message.author.id;
    const guildId = message.guild.id;

    const unsealHistory = await getEternalUnsealHistory(userId) || [];
    const dungeonWins = await getEternalDungeonWins(userId, guildId) || [];

    if (!unsealHistory.length && !dungeonWins.length) {
      await message.reply('❌ No Eternal activity found. Start unsealing and dungeon farming first!');
      return;
    }

    const pages = [];

    // 📜 Build Unseal History Pages
    if (unsealHistory.length) {
      const embed = new EmbedBuilder()
        .setTitle('🔓 Eternity Unseal History')
        .setColor('#00ff99')
        .setDescription(
          unsealHistory.map((unseal, index) => {
            return `#${index + 1}: 🧱 Eternity ${unseal.eternalityAtUnseal} | 🔥 ${unseal.flamesCost.toLocaleString()} flames | 🕰️ ${new Date(unseal.createdAt).toLocaleString()}`;
          }).join('\n\n')
        )
        .setFooter({ text: 'Unseals are limited to last 10 records.' })
        .setTimestamp();

      pages.push(embed);
    }

    // 🐉 Build Dungeon Win Pages
    if (dungeonWins.length) {
      const chunks = chunkArray(dungeonWins, 5); // 5 wins per page

      chunks.forEach((chunk, pageIndex) => {
        const embed = new EmbedBuilder()
          .setTitle(`🐉 Eternal Dungeon Wins (Page ${pageIndex + 1})`)
          .setColor('#3399ff')
          .setDescription(
            chunk.map((win, index) => {
              return `#${(pageIndex * 5) + index + 1}: 🔥 +${win.flamesEarned} flames | 🕰️ ${new Date(win.createdAt).toLocaleString()}`;
            }).join('\n\n')
          )
          .setTimestamp();

        pages.push(embed);
      });
    }

    await paginateEmbedWithSelect(message, pages, 120000); // 2 minutes timeout
  }
});

// 📦 Helper: splits array into chunks
function chunkArray(arr: any[], size: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}