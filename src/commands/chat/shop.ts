const { getShopItems } = require('/home/ubuntu/ep_bot/extras/functions');
import { PrefixCommand } from '../../handler';
import { Message, EmbedBuilder } from 'discord.js';

export default new PrefixCommand({
  name: "shop",
  aliases: ["store", "myshop"],
  allowedGuilds: ['1135995107842195550'],
  allowedRoles: ['1147864509344661644', '1148992217202040942', '1147864509344661644'],
  allowedCategories: [
    '1147909067172483162',
    '1147909156196593787',
    '1147909539413368883',
    '1147909373180530708',
    '1147909282201870406',
    '1147909200924643349',
    '1140190313915371530',
    '1320055421561471048', // Epic Wonderland Supreme Land 2
    '1137072690264551604', // epic park staff area
    '1128607975972548711', // Luminescent Staff
  ],
  async execute(message: Message): Promise<void> {
    const items = await getShopItems();
    if (!items.length) {
      await message.reply('The shop is empty!');
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("🛒 Parkman Coin Shop")
      .setDescription("**Spend your hard-earned coins here!**\nUse `ep buy <item name>` to purchase.\n")
      .setColor(0xfbbf24) // gold
      .setFooter({ text: "Tip: New items may appear often. Check back!" });

    // Add each item as an embed field
    items.forEach(item => {
      embed.addFields({
        name: `✨ ${item.name}`,
        value: `**Cost:** \`${item.cost}\` coins\n${item.description ? item.description : ""}`,
        inline: false
      });
    });

    await message.reply({ embeds: [embed] });
  }
});