import config from '../../../config';
import { Event } from '../base/Event';
import { client } from '../../../index';
import { Events, type Message } from 'discord.js';
import { CommandHandler } from '../../commands/services/CommandHandler';
import { eternalEmbedResponder } from '../../../services/externalEmbedListener';
import { addEternalUnseal } from '/home/ubuntu/ep_bot/extras/functions'; // 🧩 make sure this is imported!

export default new Event({
  name: Events.MessageCreate,
  async execute(message: Message): Promise<void> {
    // 👁 Listen to all embeds and user replies for Eternal sessions
    await eternalEmbedResponder(message);

    if (!client.user || message.author.bot || !message.guild) return;

    const lowerContent = message.content.toLowerCase();

    if (lowerContent.includes("rpg void unseal eternity")) {
      try {
        await addEternalUnseal(message.author.id, message.guild.id);
        console.log(`✅ Eternal unseal recorded for ${message.author.id}`);
      } catch (err) {
        console.error("❌ Failed to record eternal unseal:", err);
      }
    }

    // 📜 Handle prefix-based commands (ex: ep eternal)
    const prefix = config.getPrefix?.(message.guild.id) ?? config.prefix;
    if (!lowerContent.startsWith(prefix)) return;

    await CommandHandler.handlePrefixCommand(message);
  }
});