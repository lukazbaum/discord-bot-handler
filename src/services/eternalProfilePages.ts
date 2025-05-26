// eternalProfilePages.ts

import { EmbedBuilder, time, TimestampStyles } from 'discord.js';
import { loadEternalProfile, ensureEternityProfile } from './eternityProfile';
import { getEternityPlan, getEternalUnsealHistory, getEternityProfile } from '/home/ubuntu/ep_bot/extras/functions';

export async function buildEternalProfilePages(
  userId: string,
  guildId: string,
  discordUsername?: string
): Promise<{ pages: EmbedBuilder[]; labels: string[] }> {
  // 1. Load or create profile
  let profile = await loadEternalProfile(userId, guildId);
  if (!profile) {
    await ensureEternityProfile(userId, guildId);
    profile = await loadEternalProfile(userId, guildId);
    if (!profile) throw new Error(`Failed to create Eternity Profile for ${userId}`);
  }

  const displayName      = discordUsername ?? 'Eternity User';
  const dbRow = await getEternityProfile(userId, guildId);
  const flamesOwned = dbRow?.flames_owned ?? 0;

  const {
    currentEternity = 0,
    dungeonWins     = [],
    lastUnsealTT    = 0,
    ttsGainedDuringSeal = 0
  } = profile;

  // 2. Load plan
  const plan          = await getEternityPlan(userId, guildId);
  const plannedTarget = plan?.targetEternity ?? 'N/A';

  // 3. Pull raw unseals & filter by guild, take 10 most recent
  const rawUnseals    = await getEternalUnsealHistory(userId, guildId);
  const unsealHistory = (rawUnseals as any[]).slice(0, 10);  // already newest first
  const lastUnseal    = unsealHistory[0];
  const lastBonusTT   = lastUnseal?.bonusTT ?? 0;

  // 4. Page 1 – Summary
  const page1 = new EmbedBuilder()
    .setTitle('📜 Eternal Profile')
    .setDescription(`**${displayName}**’s Eternity overview`)
    .setColor('#00ccff')
    .addFields(
      { name: '🏆 Current Eternity',   value: currentEternity.toLocaleString(), inline: true },
      { name: '📌 Target Goal',         value: `${plannedTarget}`,               inline: true },
      { name: '📅 Last Unseal Date',    value: lastUnseal
          ? time(new Date(lastUnseal.unsealDate), TimestampStyles.ShortDate)
          : 'N/A',                           inline: true },
      { name: '⏳ Last Unseal TT',      value: `${lastUnsealTT.toLocaleString()} TT`, inline: true },
      { name: '💠 Last Bonus TT',       value: `${lastBonusTT.toLocaleString()} 🌀`,    inline: true },
      { name: '🔥 Flames Owned',        value: flamesOwned.toLocaleString(),           inline: true },
      { name: '🏰 Dungeon Wins',        value: dungeonWins.length.toLocaleString(),    inline: true }
    )
    .setFooter({ text: 'ParkMan Eternal Progress Tracker' })
    .setTimestamp();

  // 5. Page 2 – 90-Day Summary
  const past90Days   = Array.from({length:90}, (_,i)=> {
    const d = new Date();
    d.setDate(d.getDate() - (89 - i));
    return d.toISOString().slice(0,10);
  });
  const flamesPerDay = new Map<string,number>();
  const winsPerDay   = new Map<string,number>();
  dungeonWins.forEach(w => {
    const d = new Date((w as any).winDate).toISOString().slice(0,10);
    flamesPerDay.set(d, (flamesPerDay.get(d)||0) + (w as any).flamesEarned);
    winsPerDay.set(d,   (winsPerDay.get(d)||0)   + 1);
  });
  const flameSeries   = past90Days.map(d=>flamesPerDay.get(d)||0);
  const dungeonSeries = past90Days.map(d=>winsPerDay.get(d)||0);
  const activeDays    = flameSeries.filter(v=>v>0).length;
  const totalFlames   = flameSeries.reduce((a,b)=>a+b,0);
  const totalDungeons = dungeonSeries.reduce((a,b)=>a+b,0);
  const avgFlames     = activeDays?Math.floor(totalFlames/activeDays):0;
  const avgDungeons   = activeDays?Math.floor(totalDungeons/activeDays):0;
  const bar = (v:number,max:number,len=8)=>{
    const f = Math.round((v/max)*len);
    return '█'.repeat(f)+'░'.repeat(len-f);
  };
  const top5 = [...winsPerDay.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([d, wins], i, arr) => {
      const flames = flamesPerDay.get(d) || 0;
      const maxWins = arr[0][1];
      return `#${i + 1} – ${d}: **${wins}** wins (${flames.toLocaleString()} 🔥) \`${bar(wins, maxWins)}\``;
    });
  const page2 = new EmbedBuilder()
    .setTitle('📊 90-Day Dungeon Summary')
    .setColor('#ffaa00')
    .addFields(
      { name: '🏅 Top 5 Dungeon Win Days', value: top5.join('\n'), inline: false },
      { name: '📊 Summary (90 Days)',
        value: [
          `• 🔥 Avg flames/day: **${avgFlames.toLocaleString()}**`,
          `• 🏰 Avg wins/day: **${avgDungeons.toLocaleString()}**`,
          `• 💯 Total flames: **${totalFlames.toLocaleString()}**`,
          `• 🎯 Total wins: **${totalDungeons.toLocaleString()}**`
        ].join('\n'),
        inline: false
      }
    )
    .setFooter({ text: 'Includes only days with dungeon wins.' })
    .setTimestamp();

  // 6. Page 3 – Monthly History
  const monthlyFlames = new Map<string,number>();
  const monthlyWins   = new Map<string,number>();
  dungeonWins.forEach(w=>{
    const dt = new Date((w as any).winDate);
    const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
    monthlyFlames.set(key,(monthlyFlames.get(key)||0)+(w as any).flamesEarned);
    monthlyWins.set(key,  (monthlyWins.get(key)||0)+1);
  });
  const monthly = [...monthlyFlames.entries()]
    .sort((a,b)=>a[0].localeCompare(b[0]))
    .map(([m,v])=> `**${m}**: ${v.toLocaleString()} 🔥 (${monthlyWins.get(m)||0} wins)`);

  const page3 = new EmbedBuilder()
    .setTitle('📆 Monthly Dungeon History')
    .setColor('#00aaff')
    .addFields({
      name: '🗓️ Monthly Totals',
      value: monthly.length ? monthly.join('\n') : 'No dungeon data.'
    })
    .setTimestamp();

  // 7. Page 4 – Unseal History
  const page4 = new EmbedBuilder()
    .setTitle('🔓 Your Last Unseals')
    .setColor('#ff4444')
    .setDescription(
      unsealHistory.length
        ? unsealHistory
          .map(u => {
            const dateStr = time(new Date((u as any).unsealDate), TimestampStyles.ShortDate);
            const flames  = `🔥 -${(u as any).flamesCost.toLocaleString()} flames`;
            const bonus   = `🌀 +${(u as any).bonusTT.toLocaleString()} TT`;
            const lvl     = `📈 E-${(u as any).eternalityAtUnseal}`;
            return `:small_blue_diamond:  ${dateStr} ┃ ${flames} ┃ ${bonus} ┃ ${lvl}`;
          })
          .join('\n')
        : "You haven't unsealed yet!"
    )
    .setTimestamp();


  return {
    pages: [page1, page2, page4, page3],
    labels: ['📜 Profile', '📊 90-Day', '🔓 Unseals', '📆 Monthly']
  };
}