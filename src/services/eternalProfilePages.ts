// src/services/eternalProfilePages.ts

import { EmbedBuilder, time, TimestampStyles } from 'discord.js';
import { loadEternalProfile, ensureEternityProfile } from './eternityProfile';
import { getEternityPlan, getEternalUnsealHistory } from '/home/ubuntu/ep_bot/extras/functions';

export async function buildEternalProfilePages(
  userId: string,
  guildId: string,
  discordUsername?: string
): Promise<EmbedBuilder[]> {
  let profile = await loadEternalProfile(userId, guildId);

  if (!profile) {
    console.warn(`⚠️ No Eternity Profile found for ${userId} (${guildId}). Attempting to create...`);
    await ensureEternityProfile(userId, guildId);
    profile = await loadEternalProfile(userId, guildId);
    if (!profile) {
      throw new Error(`❌ Still failed to create profile for ${userId}`);
    }
    console.log(`🆕 Blank Eternity Profile created for ${userId}`);
  }

  const displayName = discordUsername || "Eternity User";
  const dungeonWins = profile.dungeonWins ?? [];
  const unsealHistory = profile.unsealHistory ?? [];

  const flamesOwned = profile.flamesOwned ?? 0;
  const lastUnsealTT = profile.lastUnsealTT ?? 0;
  const lastUnsealBonus = unsealHistory?.[0]?.bonusTT ?? 0;
  const lastUnsealEternity = unsealHistory?.[0]?.eternalityAtUnseal ?? 'N/A';

  const plan = await getEternityPlan(userId, guildId);
  const plannedTarget = plan?.targetEternity ?? 'N/A';

  let estimatedUnsealDate: Date | null = null;
  if (plan?.daysSealed && unsealHistory.length > 0) {
    const lastDate = new Date(unsealHistory[0].createdAt);
    estimatedUnsealDate = new Date(lastDate.getTime() + plan.daysSealed * 24 * 60 * 60 * 1000);
  }

  // 📜 Page 1 – Main Profile
  const page1 = new EmbedBuilder()
    .setTitle(`📜 Eternal Profile for ${displayName}`)
    .setColor('#00ccff')
    .addFields(
      { name: '🏆 Current Eternality', value: `${profile.currentEternity.toLocaleString()}`, inline: true },
      { name: '🧱 Eternity at Last Unseal', value: lastUnsealEternity.toString(), inline: true },
      { name: '🔥 Flames Owned', value: `${flamesOwned.toLocaleString()}`, inline: true },
      { name: '🏰 Total Dungeon Wins', value: `${dungeonWins.length.toLocaleString()}`, inline: true },
      { name: '💠 Bonus TT from Last Unseal', value: `${lastUnsealBonus.toLocaleString()}`, inline: true },
      { name: '📌 Planned Target Eternity', value: `${plannedTarget}`, inline: true },
    )
    .setFooter({ text: 'ParkMan Eternal Progress Tracker' })
    .setTimestamp();

  if (estimatedUnsealDate) {
    page1.addFields({
      name: "🕓 Estimated Unseal Date",
      value: `${time(estimatedUnsealDate, TimestampStyles.ShortDate)} (${time(estimatedUnsealDate, TimestampStyles.RelativeTime)})`,
      inline: true
    });
  }

  // 🔓 Page 2 – Unseal History
  const page2 = new EmbedBuilder()
    .setTitle(`🔓 Recent Eternity Unseals`)
    .setColor('#ff8800')
    .setDescription(
      unsealHistory.length
        ? unsealHistory.map((u: any) =>
          `• **${new Date(u.createdAt).toLocaleDateString()}** → -${u.flamesCost.toLocaleString()} 🔥 / +${u.bonusTT.toLocaleString()} 🕰️`
        ).join('\n')
        : "No unseals recorded yet."
    )
    .setFooter({ text: 'Tracking your path through Eternity...' })
    .setTimestamp();

  // 🐉 Page 3 – Dungeon Summary
  const dailyDungeonSummary: Record<string, { flames: number; wins: number }> = {};
  for (const win of dungeonWins) {
    const dateKey = new Date(win.createdAt).toLocaleDateString();
    if (!dailyDungeonSummary[dateKey]) {
      dailyDungeonSummary[dateKey] = { flames: 0, wins: 0 };
    }
    dailyDungeonSummary[dateKey].flames += win.flamesEarned;
    dailyDungeonSummary[dateKey].wins += 1;
  }

  const sortedDates = Object.keys(dailyDungeonSummary).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  const top5 = [...sortedDates]
    .sort((a, b) => dailyDungeonSummary[b].flames - dailyDungeonSummary[a].flames)
    .slice(0, 5)
    .map(date => {
      const { flames, wins } = dailyDungeonSummary[date];
      return `• **${date}** → ${flames.toLocaleString()} 🔥 (${wins} win${wins !== 1 ? 's' : ''})`;
    });

  const rest = sortedDates
    .map(date => {
      const { flames, wins } = dailyDungeonSummary[date];
      return `• **${date}** → ${flames.toLocaleString()} 🔥 (${wins} win${wins !== 1 ? 's' : ''})`;
    });

  const page3 = new EmbedBuilder()
    .setTitle(`🐉 Dungeon Wins (Daily Summary)`)
    .setColor('#4caf50')
    .setDescription(
      sortedDates.length
        ? `🏆 **Top 5 Flame Days:**\n${top5.join('\n')}\n\n📆 **All Daily Records:**\n${rest.join('\n')}`
        : "No dungeon wins recorded yet."
    )
    .setFooter({ text: 'Victory echoes across time...' })
    .setTimestamp();

  return [page1, page2, page3];
}