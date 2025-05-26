// src/events/messageCreate.ts

import config from '../../../config';
import { Event } from '../base/Event';
import { client } from '../../../index';
import { Events, Message } from 'discord.js';
import { CommandHandler } from '../../commands/services/CommandHandler';

import {
  handleFlameDetection,
  handleProfileEmbed,
  handleEternalProfileEmbed,
  handleEternalDungeonVictory,
  handleEternalUnsealMessage,
} from '../../../services/externalEmbedListener';
import { updateCareer } from '../../../services/eternityCareerUpdater';

const EPIC_RPG_BOT_ID = '555955826880413696';

export default new Event({
  name: Events.MessageCreate,
  async execute(message: Message): Promise<void> {
    // ignore self, DMs, other bots
    if (!client.user || message.author.id === client.user.id || !message.guild) return;

    const prefix      = config.getPrefix?.(message.guild.id) ?? config.prefix;
    const lower       = message.content.toLowerCase();
    const isEpicEmbed = message.author.id === EPIC_RPG_BOT_ID && message.embeds.length > 0;

    // 1️⃣ Human‐triggered commands (e.g. ep eternal …)
    if (!message.author.bot && lower.startsWith(prefix.toLowerCase())) {
      await CommandHandler.handlePrefixCommand(message);
      return;
    }

    // 2️⃣ All EpicRPG embeds
    if (!isEpicEmbed) return;
    const e = message.embeds[0];
    const authorKey = e.author?.name.split('—')[1]?.trim().toLowerCase();

    // 2️⃣ inventory embeds (rpg i / /inventory)
    if (authorKey === 'inventory') {
      await handleFlameDetection(message);
      await message.react('<:ep_greenleaf:1375735418292801567>');
      return;
    }



    // 3️⃣ dungeon win embeds
    if (
      authorKey === 'dungeon' &&
      e.fields[0]?.name.toLowerCase().includes('is dead') &&
      e.fields[1]?.name.toLowerCase().includes('eternity flame')
    ) {
      try {
        await handleEternalDungeonVictory(message);
        await updateCareer(message.author.id, message.guild.id);
        await message.react('<:ep_greenleaf:1375735418292801567>');
      } catch (err) {
        console.error('❌ Failed to process Dungeon Win:', err);
      }
      return;
    }

    // 4️⃣ eternity‐profile embeds (rpg p e)
    if (authorKey === 'eternal' && e.fields.some(f => f.name.toLowerCase().includes('eternal progress'))) {
      try {
        await handleEternalProfileEmbed(message);
        await updateCareer(message.author.id, message.guild.id);
        await message.react('<:ep_greenleaf:1375735418292801567>');
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // 5️⃣ plain‐text unseal
    if (lower.includes('unsealed the eternity for')) {
      try {
        await handleEternalUnsealMessage(message);
        await updateCareer(message.author.id, message.guild.id);
        await message.react('<:ep_greenleaf:1375735418292801567>');
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // 6️⃣ profile embeds (rpg p)
    if (authorKey === 'profile' && e.fields.some(f => f.name.toLowerCase().includes('progress'))) {
      await handleProfileEmbed(message);
      await message.react('<:ep_greenleaf:1375735418292801567>');
      return;
    }
  }
});