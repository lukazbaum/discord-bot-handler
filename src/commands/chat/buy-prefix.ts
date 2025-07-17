const { getShopItem, getUserCoins, removeUserCoins } = require('/home/ubuntu/ep_bot/extras/functions');
import { PrefixCommand } from "../../handler";
import { Message } from 'discord.js';

export default new PrefixCommand({
  name: "buy",
  aliases: ["by"],
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
    '1320055421561471048',
    '1137072690264551604',
    '1128607975972548711',
  ],

  async execute(message: Message): Promise<void> {
    const commandBody = message.content.replace(/^ep (buy|by)\s+/i, "").trim();
    const itemName = commandBody;

    if (!itemName) {
      await message.reply('Usage: `ep buy <item name>`');
      return;
    }
    const item = await getShopItem(itemName);
    if (!item) {
      await message.reply(`❌ Item "${itemName}" not found in the shop.`);
      return;
    }
    const coins = await getUserCoins(message.author.id);
    if (coins < item.cost) {
      await message.reply(`❌ You need ${item.cost} coins, but only have ${coins}.`);
      return;
    }
    const success = await removeUserCoins(message.author.id, item.cost);
    if (!success) {
      await message.reply(`❌ Could not complete the purchase. (Balance changed?)`);
      return;
    }
    await message.reply(`✅ You bought **${item.name}** for ${item.cost} coins!`);
  }
});