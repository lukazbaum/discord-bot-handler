import config from '../../../config';
import { Event } from '../base/Event';
import { client } from '../../../index';
import { Events, Message } from 'discord.js';
import { CommandHandler } from '../../commands/services/CommandHandler';
import { eternalEmbedResponder } from '../../../services/externalEmbedListener';

import {
  handleEternalProfileEmbed,
  handleEternalUnsealMessage,
  handleEternalDungeonVictory
} from '../../../services/eternityEvents';

import { updateCareer } from '../../../services/eternityCareerUpdater';

export default new Event({
  name: Events.MessageCreate,
  async execute(message: Message): Promise<void> {
    if (!message.guild) return;
    if (!message.author) return;

    const lowerContent = message.content.toLowerCase();

    // 📖 Always try to handle Eternal embed sessions
    await eternalEmbedResponder(message);

    // 📦 Bot Embed Detection
    if (message.embeds.length && message.author.bot) {
      const embed = message.embeds[0];

      // 🧠 Eternity Profile
      if (embed?.fields?.some(f => f.name.toLowerCase().includes("eternal progress"))) {
        try {
          await handleEternalProfileEmbed(message);
          await updateCareer(message.author.id, message.guild.id);
          await message.react('✅'); // Tick on profile processed
          console.log(`✅ Eternity Profile updated`)
        } catch (err) {
          console.error("❌ Failed to process Eternity Profile:", err);
        }
      }

      // 🐉 Eternal Dungeon Victory
      if (embed?.fields?.[0]?.name?.includes("is dead!") && embed?.fields?.[1]?.name?.includes("eternity flames")) {
        try {
          await handleEternalDungeonVictory(message);
          await updateCareer(message.author.id, message.guild.id);
          await message.react('🐉'); // Dragon emoji on dungeon win
          console.log(`🐉 Eternal Dungeon Win detected`);
        } catch (err) {
          console.error("❌ Failed to process Dungeon Win:", err);
        }
      }
    }

    // 🔓 Unseal Detection (Text)
    if (lowerContent.includes("unsealed the eternity for")) {
      try {
        await handleEternalUnsealMessage(message);
        await updateCareer(message.author.id, message.guild.id);
        await message.react('🔓'); // Unlock emoji for unseal
        console.log(`🔓 Eternity Unseal detected`);
      } catch (err) {
        console.error("❌ Failed to process Unseal:", err);
      }
    }

    // 🎯 Finally: Human Prefix Command Handler (ep commands)
    const prefix = config.getPrefix?.(message.guild.id) ?? config.prefix;
    const lowerPrefix = prefix.toLowerCase();

    if (!message.author.bot && message.content.toLowerCase().startsWith(lowerPrefix)) {
      await CommandHandler.handlePrefixCommand(message);
    }
  }
});