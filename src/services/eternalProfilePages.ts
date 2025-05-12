import { EmbedBuilder, time, TimestampStyles } from 'discord.js';
import { loadEternalProfile, ensureEternityProfile } from './eternityProfile';
import { getEternityPlan } from '/home/ubuntu/ep_bot/extras/functions';

export async function buildEternalProfilePages(
  userId: string,
  guildId: string,
  discordUsername?: string
): Promise<{ pages: EmbedBuilder[]; labels: string[] }> {
  let profile = await loadEternalProfile(userId, guildId);
  if (!profile) {
    console.warn(`⚠️ No Eternity Profile found for ${userId}. Creating...`);
    await ensureEternityProfile(userId, guildId);
    profile = await loadEternalProfile(userId, guildId);
    if (!profile) throw new Error(`❌ Failed to create Eternity Profile for ${userId}`);
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
  const plan = await getEternityPlan(userId, guildId);
  const plannedTarget = plan?.targetEternity ?? 'N/A';

  let estimatedUnsealDate: Date | null = null;
  if (plan?.daysSealed && lastUnseal?.createdAt) {
    estimatedUnsealDate = new Date(new Date(lastUnseal.createdAt).getTime() + plan.daysSealed * 86400000);
  }

  function getFlameBar(flames: number, max: number, length = 8): string {
    const filled = Math.round((flames / max) * length);
    return '`' + '█'.repeat(filled) + '░'.repeat(length - filled) + '`';
  }

  function getFlameSparkline(dailyFlames: number[]): string {
    const chars = ['▁','▂','▃','▄','▅','▆','▇','█'];
    const max = Math.max(...dailyFlames, 1);
    return dailyFlames.map(v => chars[Math.floor((v / max) * (chars.length - 1))]).join('');
  }

  const past90Days = [...Array(90)].map((_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (89 - i));
    return day.toISOString().slice(0, 10);
  });

  const flamesPerDay = new Map<string, number>();
  const dungeonsPerDay = new Map<string, number>();

  for (const win of dungeonWins) {
    const date = new Date(win.winDate).toISOString().slice(0, 10);
    flamesPerDay.set(date, (flamesPerDay.get(date) || 0) + win.flamesEarned);
    dungeonsPerDay.set(date, (dungeonsPerDay.get(date) || 0) + 1);
  }

  const flameSeries = past90Days.map(d => flamesPerDay.get(d) || 0);
  const dungeonSeries = past90Days.map(d => dungeonsPerDay.get(d) || 0);
  const sparkline = getFlameSparkline(flameSeries);

  const totalFlames = flameSeries.reduce((sum, val) => sum + val, 0);
  const totalDungeons = dungeonSeries.reduce((sum, val) => sum + val, 0);
  const activeDays = flameSeries.filter(v => v > 0).length;
  const avgFlames = activeDays ? Math.floor(totalFlames / activeDays) : 0;
  const avgDungeons = activeDays ? Math.floor(totalDungeons / activeDays) : 0;

  const topFlameDays = [...flamesPerDay.entries()].sort((a, b) => b[1] - a[1]);
  const maxFlames = topFlameDays[0]?.[1] || 1;

  const top3Summary = topFlameDays.slice(0, 3).map(([date, flames], i) =>
    `#${i + 1} – ${date}: **${flames.toLocaleString()}** 🔥 ${getFlameBar(flames, maxFlames)}`
  );

  const top5Detail = topFlameDays.slice(0, 5).map(([date, flames], i, arr) => {
    const wins = dungeonsPerDay.get(date) || 0;
    const bar = getFlameBar(flames, arr[0][1]);
    return `#${i + 1} – ${date}: **${flames.toLocaleString()}** 🔥 (${wins} wins) ${bar}`;
  });

  // 📄 Page 1 – Summary
  const page1 = new EmbedBuilder()
    .setTitle("📜 Eternal Profile")
    .setDescription(`**${displayName}**'s Eternity stats and progress overview.`)
    .setColor('#00ccff')
    .addFields(
      { name: '🏆 Current Eternity', value: `${currentEternity.toLocaleString()}`, inline: true },
      { name: '📌 Target Goal', value: `${plannedTarget}`, inline: true },
      { name: '💠 Last Bonus TT', value: `${lastUnsealBonus.toLocaleString()} 🌀`, inline: true },
      { name: '⏳ Last Unseal TT', value: `${lastUnsealTT.toLocaleString()} TT`, inline: true },
      { name: '🔥 Flames Owned', value: `${flamesOwned.toLocaleString()}`, inline: true },
      { name: '🏰 Dungeon Wins', value: `${dungeonWins.length.toLocaleString()}`, inline: true },
      ...(estimatedUnsealDate ? [{
        name: '🕓 Est. Next Unseal',
        value: `${time(estimatedUnsealDate, TimestampStyles.ShortDate)}\n(${time(estimatedUnsealDate, TimestampStyles.RelativeTime)})`,
        inline: true
      }] : []),
      ...(topFlameDays.length ? [{
        name: '📅 Top 3 Flame Days',
        value: topFlameDays.slice(0, 3).map(([date, flames], i) =>
          `#${i + 1} – ${date}: **${flames.toLocaleString()}** 🔥 ${getFlameBar(flames, maxFlames)}`
        ).join('\n'),
        inline: false
      }] : [])
    )
    .setFooter({ text: 'ParkMan Eternal Progress Tracker' })
    .setTimestamp();

  const page2 = new EmbedBuilder()
    .setTitle("📊 90-Day Dungeon Summary")
    .setDescription("Flame & Dungeon activity across the last 90 days.")
    .setColor('#ffaa00')
    .addFields(
      {
        name: "🏅 Top 5 Flame Days",
        value: topFlameDays.slice(0, 5).map(([date, flames], i, arr) => {
          const wins = dungeonsPerDay.get(date) || 0;
          const bar = getFlameBar(flames, arr[0][1]);
          return `#${i + 1} – ${date}: **${flames.toLocaleString()}** 🔥 (${wins} wins) ${bar}`;
        }).join('\n'),
        inline: false
      },
      {
        name: "📊 Summary (90 Days)",
        value: [
          `• 🔥 **Avg Flames/Day:** ${avgFlames.toLocaleString()}`,
          `• 🏰 **Avg Dungeons/Day:** ${avgDungeons.toLocaleString()} _(across ${activeDays} active days)_`,
          `• 💯 **Total Flames:** ${totalFlames.toLocaleString()}`,
          `• 🎯 **Total Dungeons:** ${totalDungeons.toLocaleString()}`
        ].join("\n"),
        inline: false
      }
    )
    .setFooter({ text: 'Includes only days where dungeons were won and flames were earned.' })
    .setTimestamp();

  // 📄 Page 3 – Monthly Flame and Dungeon History
  const monthlyFlames = new Map<string, number>();
  const monthlyWins = new Map<string, number>();

  for (const win of dungeonWins) {
    const date = new Date(win.winDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    monthlyFlames.set(key, (monthlyFlames.get(key) || 0) + win.flamesEarned);
    monthlyWins.set(key, (monthlyWins.get(key) || 0) + 1);
  }

  const sortedMonthly = [...monthlyFlames.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, flames]) => {
      const wins = monthlyWins.get(month) || 0;
      return `**${month}**: ${flames.toLocaleString()} 🔥 (${wins} wins)`;
    });

  const page3 = new EmbedBuilder()
    .setTitle("📆 Monthly Dungeon History")
    .setDescription("All-time totals by month for dungeon flames and win counts.")
    .setColor('#00aaff')
    .addFields({
      name: "🗓️ Monthly Summary",
      value: sortedMonthly.length > 0
        ? sortedMonthly.join('\n')
        : 'No dungeon data available.'
    })
    .setFooter({ text: 'Total dungeon flames and wins per month.' })
    .setTimestamp();

  return {
    pages: [page1, page2, page3],
    labels: ['📜 Eternal Profile', '📊 90-Day Summary', '📆 Monthly History']
  };
}