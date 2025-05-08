import { EmbedBuilder, time, TimestampStyles } from 'discord.js';
import { loadEternalProfile, ensureEternityProfile } from './eternityProfile';
import { getEternityPlan } from '/home/ubuntu/ep_bot/extras/functions';

export async function buildEternalProfilePages(
  userId: string,
  guildId: string,
  discordUsername?: string
): Promise<EmbedBuilder[]> {
  let profile = await loadEternalProfile(userId, guildId);

  if (!profile) {
    console.warn(`⚠️ No Eternity Profile found for ${userId}. Creating...`);
    await ensureEternityProfile(userId, guildId);
    profile = await loadEternalProfile(userId, guildId);
    if (!profile) throw new Error(`❌ Failed to create Eternity Profile for ${userId}`);
    console.log(`🆕 Blank Eternity Profile created for ${userId}`);
  }

  const displayName = discordUsername || "Eternity User";
  const {
    currentEternity = 0,
    flamesOwned = 0,
    dungeonWins = [],
    unsealHistory = [],
    lastUnsealTT = 0
  } = profile;

  const lastUnseal = unsealHistory[0];
  const lastUnsealBonus = lastUnseal?.bonusTT ?? 0;
  const lastUnsealEternity = lastUnseal?.eternalityAtUnseal ?? 'N/A';

  const plan = await getEternityPlan(userId, guildId);
  const plannedTarget = plan?.targetEternity ?? 'N/A';

  let estimatedUnsealDate: Date | null = null;
  if (plan?.daysSealed && lastUnseal?.createdAt) {
    estimatedUnsealDate = new Date(new Date(lastUnseal.createdAt).getTime() + plan.daysSealed * 86400000);
  }

  // 🔥 Group wins by winDate or createdAt
  function groupWinsByDay(wins: { flamesEarned: number, winDate?: string, createdAt?: string | Date }[]) {
    const map = new Map<string, number>();

    for (const win of wins) {
      const rawDate = win.winDate || win.createdAt;
      if (!rawDate) continue;

      const date = new Date(rawDate).toISOString().slice(0, 10); // yyyy-mm-dd
      map.set(date, (map.get(date) || 0) + win.flamesEarned);
    }

    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }

  const topFlameDays = groupWinsByDay(dungeonWins);
  const maxFlames = topFlameDays[0]?.[1] || 1;

  function getFlameBar(flames: number) {
    const ratio = flames / maxFlames;
    if (ratio >= 0.9) return '🔥🔥🔥🔥🔥';
    if (ratio >= 0.7) return '🔥🔥🔥🔥';
    if (ratio >= 0.5) return '🔥🔥🔥';
    if (ratio >= 0.3) return '🔥🔥';
    return '🔥';
  }

  // 📄 Page 1 – Profile Overview
  const page1 = new EmbedBuilder()
    .setTitle(`📜 Eternal Profile`)
    .setDescription(`**${displayName}**'s Eternity stats and progress overview.`)
    .setColor('#00ccff')
    .addFields(
      { name: '🏆 Current Eternity', value: `${currentEternity.toLocaleString()}`, inline: true },
      { name: '📌 Target Goal', value: `${plannedTarget}`, inline: true },
      { name: '​', value: '​', inline: true },

      { name: '💠 Last Bonus TT', value: `${lastUnsealBonus.toLocaleString()} 🌀`, inline: true },
      { name: '⏳ Last Unseal TT', value: `${lastUnsealTT.toLocaleString()} TT`, inline: true },
      { name: '🔥 Flames Owned', value: `${flamesOwned.toLocaleString()}`, inline: true },

      { name: '🏰 Dungeon Wins', value: `${dungeonWins.length.toLocaleString()}`, inline: true },

      ...(estimatedUnsealDate
        ? [{
          name: '🕓 Est. Next Unseal',
          value: `${time(estimatedUnsealDate, TimestampStyles.ShortDate)}\n(${time(estimatedUnsealDate, TimestampStyles.RelativeTime)})`,
          inline: true
        }]
        : []),

      ...(topFlameDays.length
        ? [{
          name: '📅 Top 3 Flame Days',
          value: topFlameDays.slice(0, 3).map(([date, total], i) =>
            `#${i + 1} – ${date}: **${total.toLocaleString()}** 🔥 ${getFlameBar(total)}`
          ).join('\n'),
          inline: false
        }]
        : [])
    )
    .setFooter({ text: 'ParkMan Eternal Progress Tracker' })
    .setTimestamp();

  return [page1];
}