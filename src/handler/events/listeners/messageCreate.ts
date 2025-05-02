import config from '../../../config';
import { Event } from '../base/Event';
import { client } from '../../../index';
import { Events, Message } from 'discord.js';
import { CommandHandler } from '../../commands/services/CommandHandler';

import {
  handleFlameDetection,
  handleEternalProfileEmbed,
  handleEternalDungeonVictory,
  handleEternalUnsealMessage,
  handleProfileEmbed
} from '../../../services/externalEmbedListener';

import { updateCareer } from '../../../services/eternityCareerUpdater';

const EPIC_RPG_BOT_ID = '555955826880413696';

export default new Event({
  name: Events.MessageCreate,
  async execute(message: Message): Promise<void> {
    if (!client.user || message.author.id === client.user.id || !message.guild) return;

    const prefix = config.getPrefix?.(message.guild.id) ?? config.prefix;
    const lowerContent = message.content.toLowerCase();
    const isFromEpicRpg = message.author.id === EPIC_RPG_BOT_ID;

// 🎯 Handle Human Prefix Commands (case-insensitive)
    if (!message.author.bot && lowerContent.startsWith(prefix.toLowerCase())) {
      console.log(`[COMMAND] Prefix command detected: ${message.content}`);
      await CommandHandler.handlePrefixCommand(message);
      return;
    }

    // 🔥 Inventory Embed (`rpg i`)
    if (isFromEpicRpg && message.embeds.length) {
      await handleFlameDetection(message);
    }

    // 🧠 Profile Embed (`rpg p`)
    if (isFromEpicRpg && message.embeds.length) {
      const embed = message.embeds[0];
      if (embed?.fields?.some(f => f.name.toLowerCase().includes("progress"))) {
        await handleProfileEmbed(message); // 🧠 Cache TT from rpg p
      }
    }

    // 📦 Eternity Embeds (rpg p e / dungeon wins)
    if (isFromEpicRpg && message.embeds.length) {
      const embed = message.embeds[0];

      // 🧠 Eternity Profile (`rpg p e`)
      if (embed?.fields?.some(f => f.name.toLowerCase().includes("eternal progress"))) {
        try {
          await handleEternalProfileEmbed(message);
          await updateCareer(message.author.id, message.guild.id);
          await message.react('✅');
          console.log(`✅ Eternity Profile updated`);
        } catch (err) {
          console.error("❌ Failed to process Eternity Profile:", err);
        }
      }

      // 🐉 Eternal Dungeon Win
      if (
        embed?.fields?.[0]?.name?.toLowerCase().includes("is dead!") &&
        embed?.fields?.[1]?.value?.includes("eternity flame")
      ) {
        try {
          await handleEternalDungeonVictory(message);
          await updateCareer(message.author.id, message.guild.id);
          await message.react('🐉');
          console.log(`🐉 Eternal Dungeon Win detected`);
        } catch (err) {
          console.error("❌ Failed to process Dungeon Win:", err);
        }
      }
    }

    // 🔓 Unseal Text Message
    if (lowerContent.includes("unsealed the eternity for")) {
      try {
        await handleEternalUnsealMessage(message);
        await updateCareer(message.author.id, message.guild.id);
        await message.react('🔓');
        console.log(`🔓 Eternity Unseal detected`);
      } catch (err) {
        console.error("❌ Failed to process Eternity Unseal:", err);
      }
    }
  }
});