import { Message } from "discord.js";
import {
  parseEternalEmbed,
  parseDungeonEmbed
} from "./eUtils";

import {
  saveOrUpdateEternityProfile,
  addEternalDungeonWin,
  addEternalUnseal,
  getEternityProfile
} from "/home/ubuntu/ep_bot/extras/functions";

import { ensureEternityProfile } from "./eternityProfile";
import { tryFindUserIdByName } from "./eternityUtils";
import { forceProfileSync } from "./forceProfileSync";

const EPIC_RPG_BOT_ID = '555955826880413696';

/**
 * 🔥 Handle Flame Detection from RPG Inventory
 */
export async function handleFlameDetection(message: Message): Promise<void> {
  if (!message.embeds.length || message.author.id !== EPIC_RPG_BOT_ID) return;

  const embed = message.embeds[0];
  const flamesField = embed.fields?.find(field =>
    field.name.toLowerCase().includes("items") && field.value.toLowerCase().includes("eternity flame")
  );

  if (!flamesField) return;

  const flameMatch = flamesField.value.match(/eternity flame.*?:\s*([\d,]+)/i);
  const flameAmount = flameMatch ? parseInt(flameMatch[1].replace(/,/g, "")) : 0;
  if (flameAmount <= 0) return;

  const playerName = embed?.author?.name?.split("—")?.[0]?.trim();
  if (!playerName) {
    console.warn("⚠️ Could not extract player name from inventory embed.");
    return;
  }

  const guildId = message.guild?.id;
  if (!guildId) return;

  const userId = await tryFindUserIdByName(message.guild, playerName);

  if (!userId) {
    console.warn(`⚠️ Cannot resolve userId for "${playerName}"`);
    return;
  }

  const existingProfile = await getEternityProfile(userId, guildId);
  if (existingProfile) {
    await saveOrUpdateEternityProfile(userId, guildId, existingProfile.current_eternality, flameAmount);
  } else {
    await saveOrUpdateEternityProfile(userId, guildId, 0, flameAmount);
  }

  console.log(`🔥 Inventory flames updated for ${userId}: ${flameAmount.toLocaleString()}`);
  await forceProfileSync(userId, guildId);
}

/**
 * 🧠 Handle Eternal Profile Embed
 */
export async function handleEternalProfileEmbed(message: Message): Promise<void> {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const userId = message.interaction?.user?.id || message.mentions?.users.first()?.id || message.author.id;

  const embed = message.embeds[0];
  if (!embed) return;

  const parsed = parseEternalEmbed(embed);
  if (parsed?._error) {
    console.warn(`⚠️ Error parsing eternal profile for ${userId}: ${parsed._error}`);
    return;
  }

  const eternalProgress = parsed.eternalProgress || 0;

  await saveOrUpdateEternityProfile(userId, guildId, eternalProgress);

  console.log(`✅ Eternity Profile saved for ${userId}: ${eternalProgress}`);
  await forceProfileSync(userId, guildId);
}

/**
 * 🔓 Handle Eternity Unseal Event
 */
export async function handleEternalUnsealMessage(message: Message): Promise<void> {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const userId = message.author.id;

  const flamesMatch = message.content.match(/-\s*([\d,]+)\s*<:eternityflame/i);
  const flamesCost = flamesMatch ? parseInt(flamesMatch[1].replace(/,/g, "")) : 0;

  const bonusTTMatch = message.content.match(/got\s+([\d,]+)\s*<:timetravel/i);
  const bonusTT = bonusTTMatch ? parseInt(bonusTTMatch[1].replace(/,/g, "")) : 0;

  if (!flamesCost) {
    console.warn(`⚠️ Could not parse flames cost from unseal message: ${message.content}`);
    return;
  }

  await ensureEternityProfile(userId, guildId);

  await addEternalUnseal(userId, guildId, flamesCost, 0, bonusTT);
  console.log(`🔓 Unseal recorded for ${userId}: -${flamesCost} flames, +${bonusTT} TT`);

  await forceProfileSync(userId, guildId);
}

/**
 * 🐉 Handle Dungeon Victory Embed
 */
export async function handleEternalDungeonVictory(message: Message): Promise<void> {
  const userId = message.author.id;
  const guildId = message.guild?.id;
  if (!guildId) return;

  const embed = message.embeds[0];
  if (!embed) return;

  const parsed = parseDungeonEmbed(embed);
  if (parsed?._error) {
    console.warn(`⚠️ Failed to parse dungeon victory for ${userId}: ${parsed._error}`);
    return;
  }

  const flamesEarned = parsed.flamesEarned || 0;
  if (flamesEarned <= 0) {
    console.warn(`⚠️ No flames detected in dungeon win for ${userId}`);
    return;
  }

  await addEternalDungeonWin(userId, guildId, flamesEarned);
  console.log(`🐉 Dungeon win recorded for ${userId}: +${flamesEarned} flames`);

  await forceProfileSync(userId, guildId);
}