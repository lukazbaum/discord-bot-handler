import {
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

import {
  parseEternalEmbed,
  parseProfileEmbed,
  parseInventoryEmbed,
  calculateFullInfo,
  formatPagePower,
  formatPage1,
  formatPage2,
} from "./eUtils";

import { eternalSessionStore } from "./sessionStore";

import {
  handleEternalProfileEmbed,
} from "./eternityEvents";

import {
  getEternalUnsealHistory,
  saveOrUpdateEternityProfile,
  addEternalDungeonWin,
  addEternalUnseal,
} from "/home/ubuntu/ep_bot/extras/functions.js";

import { updateCareer } from './eternityCareerUpdater.js';

export async function eternalEmbedResponder(message: Message): Promise<void> {
  const userId = message.author.id;
  const guildId = message.guild?.id;
  const content = message.content.toLowerCase();
  const session = eternalSessionStore.get(userId);

  if (!guildId || !session || session.channelId !== message.channel.id) return;
  if (session.origin === "command") return;

  try {
    // 🔥 Check for RPG PE (Eternity Progress Embed)
    if (session.step === "awaitingEternal" && message.author.bot && message.embeds.length) {
      await handleEternalProfileEmbed(message);

      const parsed = parseEternalEmbed(message.embeds[0].data);
      if ("_error" in parsed) {
        await message.reply(`${parsed._error}\nPlease run \`ep et reset\`.`);
        return;
      }

      session.eternal = parsed;

      const footerText = message.embeds[0].footer?.text || "";
      if (parsed.eternalProgress < 100) {
        await message.reply("⚠️ Warning: Detected Eternity **less than 100**.\nPlease re-run `rpg p e` if needed!");
      }

      try {
        await saveOrUpdateEternityProfile(userId, guildId, parsed.eternalProgress);
        await updateCareer(userId, guildId);
      } catch (err) {
        console.error("⚠️ Failed to save eternity profile:", err);
      }

      if (footerText.toLowerCase().includes("unsealed for")) {
        session.step = "awaitingDaysSealed";
        await message.reply("⏳ You are currently **Unsealed**!\nHow many **days until you expect to Unseal**?\n_(Example: 7)_");
        return;
      }

      const history = await getEternalUnsealHistory(userId);
      if (history.length) {
        const lastUnsealDate = new Date(history[0].createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastUnsealDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        session.daysSealed = diffDays;
        session.step = "awaitingProfile";
        await message.reply(`📆 Detected **${diffDays}** days since last unseal.\n📘 Now send \`rpg p\`...`);
      } else {
        session.step = "awaitingDaysSealed";
        await message.reply("📆 No history found.\nHow many **days until you expect to Unseal**?\n_(Example: 7)_");
      }
      return;
    }

    // 🐉 Eternal Dungeon Reward Embed Detection
    if (message.author.bot && message.embeds.length) {
      const embed = message.embeds[0];
      const rewardField = embed.fields?.[0];
      const authorName = embed.author?.name?.toLowerCase() || "";

      if (rewardField && rewardField.name.toLowerCase().includes("reward") && authorName.includes("quest")) {
        const flameMatch = rewardField.value.match(/(\d[\d,]*)\s*<:eternityflame/i);
        if (flameMatch) {
          const flames = parseInt(flameMatch[1].replace(/,/g, ""));
          if (flames > 0) {
            try {
              await addEternalDungeonWin(userId, guildId, flames);
              await updateCareer(userId, guildId);
              console.log(`🐉 [Dungeon Win Recorded] ${userId}: +${flames} flames`);
            } catch (err) {
              console.warn("⚠️ Failed saving dungeon win:", err);
            }
          }
        }
      }
    }

    // 🔓 Eternity Unseal Detection
    if (content.includes("unsealed the eternity")) {
      try {
        const flamesMatch = message.content.match(/-\s*([\d,]+)\s*<:eternityflame/i);
        const flames = flamesMatch ? parseInt(flamesMatch[1].replace(/,/g, "")) : 0;
        if (flames > 0) {
          await addEternalUnseal(userId, guildId, flames, 0);
          await updateCareer(userId, guildId);
          console.log(`🔓 [Unseal Recorded] ${userId}: -${flames} flames`);
        }
      } catch (err) {
        console.warn("⚠️ Failed saving unseal event:", err);
      }
    }

  } catch (err) {
    console.error("⚠️ Eternal embed responder error:", err);
    eternalSessionStore.delete(userId);
    await message.reply("⚠️ Something went wrong. Please type `ep et reset` to restart.");
  }
}