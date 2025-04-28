// src/handler/components/menus/eternityCareerSelect.ts

import { SelectMenu } from "../../handler/components/base/SelectMenu"; // Your base SelectMenu class
import { buildFullCareerEmbed } from "../../embeds/eternityFullCareer"; // Adjust path if needed
const {
  getEternalUnsealHistory,
  getEternalDungeonWins,
  getEternityProfile,
} = require('/home/ubuntu/ep_bot/extras/functions');

export default new SelectMenu({
  customId: "eternityCareerSelect",
  async execute(interaction, [selectedValue]) {
    if (!interaction.guild) return;

    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    if (selectedValue === "full") {
      const history = await getEternalUnsealHistory(userId);
      const dungeonWins = await getEternalDungeonWins(userId, guildId);
      const eternityProfile = await getEternityProfile(userId, guildId);

      const totalUnseals = history.length;
      const totalDungeonWins = dungeonWins.length;
      const totalBonusTT = history.reduce((sum: number, h: any) => sum + (h.bonusTT || 0), 0);
      const totalFlamesBurned = history.reduce((sum: number, h: any) => sum + (h.flamesCost || 0), 0) +
        dungeonWins.reduce((sum: number, d: any) => sum + (d.flamesEarned || 0), 0);
      const highestEternity = eternityProfile?.current_eternality || 0;
      const firstUnsealDate = history.length ? new Date(history[history.length - 1].createdAt) : null;
      const latestUnsealDate = history.length ? new Date(history[0].createdAt) : null;

      const achievements: string[] = [];
      if (totalUnseals >= 10) achievements.push("🔹 10 Unseals Master");
      if (totalDungeonWins >= 10) achievements.push("🔹 10 Dungeon Slayer");
      if (highestEternity >= 500) achievements.push("🔹 500+ Eternity Achiever");

      const trends = history.slice(0, 5).map((h: any) => ({
        date: new Date(h.createdAt),
        bonusTT: h.bonusTT,
        eternityLevel: h.eternityLevel,
      }));

      const fullEmbed = buildFullCareerEmbed({
        highestEternity,
        totalFlamesBurned,
        totalBonusTT,
        totalUnseals,
        totalDungeonWins,
        firstUnsealDate,
        latestUnsealDate,
        achievements,
        trends,
      });

      await interaction.update({
        embeds: [fullEmbed],
        components: [], // Optional: Re-add menu if you want!
      });
    }
  },
});