import { PrefixCommand } from '../../handler';
import { Message, TextChannel, ThreadChannel, NewsChannel } from 'discord.js';
const { clearEternalUnsealData } = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
  name: 'eternal-clearplan',
  aliases: ['eclearplan', 'clearplan', 'eternityclear'],

  async execute(message: Message): Promise<void> {
    const userId = message.author.id;
    const guildId = message.guild?.id;
    const channel = message.channel;

    if (!guildId || !(channel instanceof TextChannel || channel instanceof ThreadChannel || channel instanceof NewsChannel)) {
      await message.reply('❌ This command can only be used inside a server text channel.');
      return;
    }

    await clearEternalUnsealData(userId, guildId);
    await message.reply('🧹 Your Eternity plan has been **cleared**!');
  }
});