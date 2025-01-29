import config from '../../../config';
import { Event } from '../base/Event';
import { client } from '../../../index';
import { Events, type Message } from 'discord.js';
import { CommandHandler } from '../../commands/services/CommandHandler';

export default new Event({
  name: Events.MessageCreate,
  async execute(message: Message): Promise<void> {
    if (!client.user || message.author.bot || !message.guild) return;

    // Get the dynamic prefix based on the guild ID, or fallback to the default
    const prefix = config.getPrefix?.(message.guild.id) ?? config.prefix;  // dynnamite prefix assignment

    // Ignore messages that don't start with the prefix
    if (!message.content.startsWith(prefix)) return;
    // Pass the message to the command handler
    await CommandHandler.handlePrefixCommand(message);
  },
});
