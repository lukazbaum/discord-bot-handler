import { Message } from "discord.js";
import { tryFindUserIdByName } from "./eternityUtils";
import {
  parseEternalEmbed,
  parseDungeonEmbed
} from "./eUtils";

import {
  saveOrUpdateEternityProfile,
  addEternalDungeonWin,
  addEternalUnseal
} from "/home/ubuntu/ep_bot/extras/functions";

import { forceProfileSync } from "./forceProfileSync";
const EPIC_RPG_BOT_ID = '555955826880413696';

/**
 * 🔥 Handle Eternity Flames detection (rpg i inventory)
 */
export async function handleFlameDetection(message: Message): Promise<void> {
  if (!message.embeds.length || message.author.id !== EPIC_RPG_BOT_ID) return;

  const embed = message.embeds[0];
  const eternityFlamesField = embed.fields?.find(field =>
    field.name.toLowerCase().includes("items") && field.value.toLowerCase().includes("eternity flame")
  );

  if (!eternityFlamesField) return;

  const flameMatch = eternityFlamesField.value.match(/eternity flame.*?:\s*([\d,]+)/i);
  const flameAmount = flameMatch ? parseInt(flameMatch[1].replace(/,/g, "")) : 0;

  if (flameAmount <= 0) return;

  const playerName = embed.author?.name?.split("—")[0]?.trim();
  if (!playerName) {
    console.warn("⚠️ Could not extract player name from embed.");
    return;
  }

  const userId = await tryFindUserIdByName(message.guild!, playerName);
  if (!userId) {
    console.warn(`⚠️ Cannot resolve Discord user for ${playerName}`);
    return;
  }

  console.log(`🔥 Detected ${flameAmount.toLocaleString()} Eternity Flames for **${playerName}** (${userId})`);

  const guildId = message.guild!.id;
  await saveOrUpdateEternityProfile(userId, guildId, 0, flameAmount);

  // Force update career/profile
  await forceProfileSync(userId, guildId);
}

/**
 * 🧠 Handle Eternity Profile Embed
 */
export async function handleEternalProfileEmbed(message: Message) {
  const embed = message.embeds[0];
  if (!embed) return;

  const playerName = embed.author?.name?.split("—")[0]?.trim();
  if (!playerName) {
    console.warn("⚠️ Could not extract player name from profile embed.");
    return;
  }

  const userId = await tryFindUserIdByName(message.guild!, playerName);
  if (!userId) {
    console.warn(`⚠️ Cannot resolve Discord user for ${playerName}`);
    return;
  }

  const parsed = parseEternalEmbed(embed);
  if (parsed._error) {
    console.warn(`⚠️ Failed to parse eternal profile for ${userId}: ${parsed._error}`);
    return;
  }

  const eternalProgress = parsed.eternalProgress || 0;
  const guildId = message.guild!.id;

  await saveOrUpdateEternityProfile(userId, guildId, eternalProgress);

  console.log(`✅ Eternity Profile saved: userId=${userId}, Eternity=${eternalProgress}`);

  await forceProfileSync(userId, guildId);
}

/**
 * 🔓 Handle Eternity Unseal
 */
export async function handleEternalUnsealMessage(message: Message): Promise<void> {
  const userId = message.author.id;
  const guildId = message.guild?.id;
  if (!guildId) return;

  const flamesMatch = message.content.match(/-\s*([\d,]+)\s*<:eternityflame/i);
  const flamesCost = flamesMatch ? parseInt(flamesMatch[1].replace(/,/g, "")) : 0;

  const bonusTTMatch = message.content.match(/got\s+([\d,]+)\s*<:timetravel/i);
  const bonusTT = bonusTTMatch ? parseInt(bonusTTMatch[1].replace(/,/g, "")) : 0;

  if (!flamesCost) {
    console.warn(`⚠️ Could not detect flames spent from message: ${message.content}`);
    return;
  }

  await addEternalUnseal(userId, guildId, flamesCost, 0, bonusTT);

  console.log(`🔓 Eternal Unseal recorded: userId=${userId}, flames=${flamesCost}, bonusTT=${bonusTT}`);

  await forceProfileSync(userId, guildId);
}

/**
 * 🐉 Handle Eternal Dungeon Victory
 */
export async function handleEternalDungeonVictory(message: Message) {
  const embed = message.embeds[0];
  if (!embed) return;

  const playerName = embed.author?.name?.split("—")[0]?.trim();
  if (!playerName) {
    console.warn("⚠️ Could not extract player name from dungeon win embed.");
    return;
  }

  const userId = await tryFindUserIdByName(message.guild!, playerName);
  if (!userId) {
    console.warn(`⚠️ Cannot resolve Discord user for ${playerName}`);
    return;
  }

  const parsed = parseDungeonEmbed(embed);
  if (parsed._error) {
    console.warn(`⚠️ Failed to parse dungeon win for ${userId}: ${parsed._error}`);
    return;
  }

  const flamesEarned = parsed.flamesEarned || 0;
  const guildId = message.guild!.id;

  await addEternalDungeonWin(userId, guildId, flamesEarned);

  console.log(`🐉 Eternal Dungeon win recorded: userId=${userId}, Flames +${flamesEarned}`);

  await forceProfileSync(userId, guildId);
}