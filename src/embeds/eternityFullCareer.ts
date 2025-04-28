import { EmbedBuilder } from "discord.js";

export function buildFullCareerEmbed({
                                       highestEternity,
                                       totalFlamesBurned,
                                       totalBonusTT,
                                       totalUnseals,
                                       totalDungeonWins,
                                       firstUnsealDate,
                                       latestUnsealDate,
                                       achievements,
                                       trends
                                     }: {
  highestEternity: number;
  totalFlamesBurned: number;
  totalBonusTT: number;
  totalUnseals: number;
  totalDungeonWins: number;
  firstUnsealDate: Date | null;
  latestUnsealDate: Date | null;
  achievements: string[];
  trends: { bonusTT: number, eternityLevel: number, date: Date }[];
}) {
  const trendLines = trends.map(t => `• ${t.bonusTT} TT @ E${t.eternityLevel} (${t.date.toLocaleDateString()})`);

  const embed = new EmbedBuilder()
    .setTitle("📜 Eternity Career - Full Stats")
    .setColor("#26c6da")
    .addFields(
      { name: "⚡ Highest Eternity", value: `**${highestEternity}**`, inline: true },
      { name: "🔥 Total Flames Burned", value: `**${totalFlamesBurned.toLocaleString()}**`, inline: true },
      { name: "🎯 Total Bonus TTs", value: `**${totalBonusTT.toLocaleString()}**`, inline: true },
      { name: "🗓️ Total Unseals", value: `**${totalUnseals}** times`, inline: true },
      { name: "🐉 Total Dungeon Wins", value: `**${totalDungeonWins}** wins`, inline: true },
      { name: "📅 First Unseal", value: firstUnsealDate ? `<t:${Math.floor(firstUnsealDate.getTime() / 1000)}:R>` : "N/A", inline: true },
      { name: "🕰️ Last Unseal", value: latestUnsealDate ? `<t:${Math.floor(latestUnsealDate.getTime() / 1000)}:R>` : "N/A", inline: true },
      { name: "📈 Bonus TT Trends", value: trendLines.length ? trendLines.join("\n") : "📭 No recent unseals.", inline: false },
      { name: "🏆 Achievements", value: achievements.length ? achievements.join("\n") : "📭 None yet!", inline: false }
    )
    .setFooter({ text: "🔥 Full Eternity Career breakdown" })
    .setTimestamp();

  return embed;
}