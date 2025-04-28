import {
  Message,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from "discord.js";

import { PrefixCommand } from "../../handler";
import { eternityCareerSelectRow } from "../../services/eternityCareerSelectRow";

const {
  getEternalUnsealHistory,
  getEternalDungeonWins,
  getEternityProfile,
} = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
  name: "profile",
  aliases: ["etprofile", "epprofile", "career"],
  allowedGuilds: ["1135995107842195550"],

  async execute(message: Message) {
    const userId = message.author.id;
    const guildId = message.guild?.id;

    if (!guildId) {
      await message.reply("⚠️ Cannot fetch career outside a guild.");
      return;
    }

    try {
      const history = await getEternalUnsealHistory(userId);
      const dungeonWins = await getEternalDungeonWins(userId, guildId);
      const eternityProfile = await getEternityProfile(userId, guildId);

      if (!history.length && !dungeonWins.length && !eternityProfile) {
        await message.reply("📭 No Eternity career history found yet. Try using `ep eternal` or winning an Edungeon first!");
        return;
      }

      const totalUnseals = history.length;
      const totalDungeonWins = dungeonWins.length;
      const totalBonusTT = history.reduce((sum: number, h: any) => sum + (h.bonusTT || 0), 0);
      const totalFlamesFromUnseals = history.reduce((sum: number, h: any) => sum + (h.flamesCost || 0), 0);
      const totalFlamesFromDungeons = dungeonWins.reduce((sum: number, d: any) => sum + (d.flamesEarned || 0), 0);
      const totalFlamesBurned = totalFlamesFromUnseals + totalFlamesFromDungeons;
      const highestEternity = eternityProfile?.current_eternality || 0;

      const firstUnsealDate = history.length ? new Date(history[history.length - 1].createdAt) : null;
      const latestUnsealDate = history.length ? new Date(history[0].createdAt) : null;

      // Trends: last 5 bonus TT efficiency
      const trends = history
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((h: any) => ({
          date: new Date(h.createdAt),
          bonusTT: h.bonusTT || 0,
          eternityLevel: h.eternityLevel || 'N/A'
        }));

      const trendLines = trends.map(t => `• ${t.bonusTT} TT @ Eternity ${t.eternityLevel} (${t.date.toLocaleDateString()})`);
      // Default Lite Career View
      const careerEmbed = new EmbedBuilder()
        .setTitle("🏆 Eternity Career (Lite)")
        .setColor("#00acc1")
        .addFields(
          { name: "⚡ Highest Eternity", value: `**${highestEternity}**`, inline: true },
          { name: "🔥 Total Flames Burned", value: `**${totalFlamesBurned.toLocaleString()}**`, inline: true },
          { name: "🎯 Total Bonus TTs", value: `**${totalBonusTT.toLocaleString()}**`, inline: true }
        )
        .setFooter({ text: "📜 Use the menu below to view Full Career!" })
        .setTimestamp();

      const bonusTrendEmbed = new EmbedBuilder()
        .setTitle("📈 Bonus TT Trends (Last 5 Unseals)")
        .setColor("#ffd54f")
        .setDescription(trendLines.length ? trendLines.join("\n") : "📭 No unseal trends yet.")
        .setTimestamp();

      await message.reply({
        embeds: [careerEmbed, bonusTrendEmbed],
        components: [eternityCareerSelectRow()]
      });

    } catch (err) {
      console.error("⚠️ Error loading eternity career:", err);
      await message.reply("❌ Failed to load your Eternity Career. Try again later.");
    }
  }
});