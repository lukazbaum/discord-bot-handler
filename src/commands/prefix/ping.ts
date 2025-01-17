import type { Message } from 'discord.js';
import { PrefixCommand } from '../../handler';

export default new PrefixCommand({
  name: 'ping',
  aliases: ['peng'],
  userCooldown: 10,

  async execute(message: Message): Promise<any> {
    await message.reply('Pong!');
  },
});
