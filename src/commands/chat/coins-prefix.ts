const { getUserCoins } = require('/home/ubuntu/ep_bot/extras/functions');
import { PrefixCommand } from "../../handler";
import { Message } from 'discord.js';

export default new PrefixCommand({
  name: "mycoins",
  aliases: ["balance", "coins"],
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
      const coins = await getUserCoins(message.author.id);
      await message.reply(`You have **${coins}** coins!`);
    }
  });