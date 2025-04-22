import config from '../../../config';
import { Event } from '../base/Event';
import { client } from '../../../index';
import { Events, type Message } from 'discord.js';
import { CommandHandler } from '../../commands/services/CommandHandler';
import { eternalEmbedResponder } from '../../../services/externalEmbedListener';

export default new Event({
  name: Events.MessageCreate,
  async execute(message: Message): Promise<void> {
    // 👁 Listen to all embeds and user replies for Eternal sessions
    await eternalEmbedResponder(message);

    if (!client.user || message.author.bot || !message.guild) return;

    const prefix = config.getPrefix?.(message.guild.id) ?? config.prefix;
    if (!message.content.startsWith(prefix)) return;

    // 🎯 Trigger `ep eternal`, `ep eternal full`, etc
    await CommandHandler.handlePrefixCommand(message);
  }
});