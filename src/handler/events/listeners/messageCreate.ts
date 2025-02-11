import config from '../../../config';
import { Event } from '../base/Event';
import { client } from '../../../index';
import { Events, type Message } from 'discord.js';
import { CommandHandler } from '../../commands/services/CommandHandler';

export default new Event({
  name: Events.MessageCreate,
  async execute(message: Message): Promise<void> {
    if (!client.user || message.author.bot) {
      return;
    }

    let prefix: string = config.prefix;
    if (message.guild?.id && config.customPrefixes) {
      const customPrefix: string | undefined = config.customPrefixes.find(
        (p) => p.guildId === message.guild!.id,
      )?.prefix;
      if (customPrefix) prefix = customPrefix;
    }

    if (!message.content.startsWith(prefix)) {
      return;
    }

    await CommandHandler.handlePrefixCommand(message);
  },
});
