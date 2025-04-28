// src/services/eternityCareerSelectRow.ts
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

export function eternityCareerSelectRow() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('eternityCareerSelect')
    .setPlaceholder('📜 Select Career View')
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Full Career View')
        .setValue('full')
        .setDescription('View full Eternity career stats & history')
        .setEmoji('📖'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Lite Career View')
        .setValue('lite')
        .setDescription('View summarized Eternity stats')
        .setEmoji('📄')
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}