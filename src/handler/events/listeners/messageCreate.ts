import config from '../../../config';
import { Event } from '../base/Event';
import { Events, Message } from 'discord.js';
import { CommandHandler } from '../../commands/services/CommandHandler';
import {
  handleFlameDetection,
  handleEternalProfileEmbed,
  handleEternalDungeonVictory,
  handleEternalUnsealMessage
} from '../../../services/externalEmbedListener';
import { updateCareer } from '../../../services/eternityCareerUpdater';

const EPIC_RPG_BOT_ID = '555955826880413696';

export default new Event({
  name: Events.MessageCreate,
  async execute(message: Message): Promise<void> {
    // ⛔ Ignore bots or DMs
    if (message.author.bot || !message.guild) return;

    const prefix = config.getPrefix?.(message.guild.id) ?? config.prefix;
    const content = message.content;
    const lowerContent = content.toLowerCase();

    // 🎯 Prefix command handling (ex: ep help)
    if (content.startsWith(prefix)) {
      await CommandHandler.handlePrefixCommand(message);
      return; // ✅ Stop further processing after command
    }

    // 📥 Embed and message parsing from Epic RPG bot
    const isFromEpicRpg = message.author.id === EPIC_RPG_BOT_ID;

    // 🔥 RPG Inventory Embed → Eternity Flame Update
    if (isFromEpicRpg && message.embeds.length) {
      await handleFlameDetection(message);
    }

    // 🧠 RPG Embed: Eternal Profile or Dungeon Victory
    if (message.embeds.length && message.author.bot) {
      const embed = message.embeds[0];
      const fields = embed?.fields ?? [];

      // 🧠 Eternal Profile Embed
      if (fields.some(f => f.name.toLowerCase().includes('eternal progress'))) {
        try {
          await handleEternalProfileEmbed(message);
          await updateCareer(message.author.id, message.guild.id);
          await message.react('✅');
          console.log(`✅ Eternity Profile updated`);
        } catch (err) {
          console.error('❌ Failed to process Eternity Profile:', err);
        }
      }

      // 🐉 Eternal Dungeon Victory Embed
      const f0 = fields[0]?.name || '';
      const f1 = fields[1]?.name || '';

      if (f0.includes('is dead!') && f1.includes('eternity flames')) {
        try {
          await handleEternalDungeonVictory(message);
          await updateCareer(message.author.id, message.guild.id);
          await message.react('🐉');
          console.log(`🐉 Eternal Dungeon Win detected`);
        } catch (err) {
          console.error('❌ Failed to process Dungeon Win:', err);
        }
      }
    }

    // 🔓 Plain-text Unseal Detection
    if (lowerContent.includes('unsealed the eternity for')) {
      try {
        await handleEternalUnsealMessage(message);
        await updateCareer(message.author.id, message.guild.id);
        await message.react('🔓');
        console.log(`🔓 Eternity Unseal detected`);
      } catch (err) {
        console.error('❌ Failed to process Eternity Unseal:', err);
      }
    }
  }
});