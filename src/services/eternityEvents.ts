import { Message } from "discord.js";
import { parseEternalEmbed, extractPlayerNameFromEmbed, extractPlayerNameFromUnsealMessage } from "./eUtils";
import {
  saveOrUpdateEternityProfile,
  addEternalUnseal,
  addEternalDungeonWin
} from "/home/ubuntu/ep_bot/extras/functions";


export async function handleEternalProfileEmbed(message: Message) {
  const embed = message.embeds[0];
  const guildId = message.guild?.id;
  if (!embed || !guildId) return;

  const playerName = extractPlayerNameFromEmbed(embed);
  if (!playerName) return;

  try {
    const parsed = parseEternalEmbed(embed.data);
    if ("_error" in parsed) return;

    const eternality = parsed.eternalProgress;

    await saveOrUpdateEternityProfile(playerName, guildId, eternality);

    console.log(`✅ Eternity Profile updated for ${playerName}: Eternity ${eternality}`);
  } catch (err) {
    console.error(`❌ Failed to handle Eternity Profile embed for ${playerName}`, err);
  }
}

/**
 * Handle Eternal Unseal message
 */
export async function handleEternalUnsealMessage(message: Message, flamesCost = 0, eternalityAtUnseal = 0) {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const playerName = extractPlayerNameFromUnsealMessage(message.content);
  if (!playerName) return;

  try {
    await addEternalUnseal(playerName, guildId, flamesCost, eternalityAtUnseal);
    console.log(`🔓 Eternal Unseal recorded for ${playerName}: -${flamesCost} flames at Eternity ${eternalityAtUnseal}`);
  } catch (err) {
    console.error(`❌ Failed to record Eternal Unseal for ${playerName}`, err);
  }
}

/**
 * Handle Eternal Dungeon Victory
 */
export async function handleEternalDungeonVictory(message: Message, flamesEarned = 0) {
  const embed = message.embeds[0];
  const guildId = message.guild?.id;
  if (!embed || !guildId) return;

  const playerName = extractPlayerNameFromEmbed(embed);
  if (!playerName) return;

  try {
    await addEternalDungeonWin(playerName, guildId, flamesEarned);
    console.log(`🐉 Eternal Dungeon Win recorded for ${playerName}: +${flamesEarned} flames`);
  } catch (err) {
    console.error(`❌ Failed to record Eternal Dungeon Win for ${playerName}`, err);
  }
}