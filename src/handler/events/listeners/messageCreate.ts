import config from '../../../config';
import { Event } from '../base/Event';
import { client } from '../../../index';
import { Events, type Message } from 'discord.js';
import { CommandHandler } from '../../commands/services/CommandHandler';

export default new Event({
  name: Events.MessageCreate,
  async execute(message: Message): Promise<void> {
    if (!client.user || message.author.bot || !message.content.startsWith(config.prefix)) return;
    await CommandHandler.handlePrefixCommand(message);
  },
});
