import { EmbedBuilder, time, TimestampStyles, Client } from 'discord.js';
import { loadEternalProfile, ensureEternityProfile } from './eternityProfile';
import {
  getEternityPlan,
  getEternalUnsealHistory,
  getDungeonWinsByServer,
  getUnsealsByServer
} from '/home/ubuntu/ep_bot/extras/functions';

/**
 * Get Discord guild/server name or fallback.
 */
function getGuildName(client: Client, guildId: string): string {
  return client.guilds.cache.get(guildId)?.name || `Server ${guildId}`;
}

/**
 * Build per-server Eternity stats breakdown page.
 */
export async function buildServerBreakdownPage(userId: string, client: Client): Promise<EmbedBuilder> {
  const wins = await getDungeonWinsByServer(userId) as any[];
  const unseals = await getUnsealsByServer(userId) as any[];

  // Map unseals by guild for quick lookup
  const unsealsMap = Object.fromEntries((unseals ?? []).map((u: any) => [u.guildId, u]));

  let desc = '';
  for (const server of wins) {
    const guildName = getGuildName(client, server.guildId);
    const serverUnseals = unsealsMap[server.guildId];

    desc += `__**🏰 ${guildName}**__\n`;
    desc += `• Dungeon Wins: **${server.wins || 0}**\n`;
    desc += `• Flames: **${Number(server.flames || 0).toLocaleString()}**\n`;
    if (serverUnseals) {
      const dateStr = (serverUnseals.dates || '').split(',').slice(0, 3).join(', ');
      desc += `• Unseals: **${serverUnseals.unseals || 0}**`;
      if (dateStr) desc += `\n• Last Unseals: ${dateStr}`;
    }
    desc += `\n\n`;
  }
  if (!desc) desc = "No stats found for this user across servers.";

  return new EmbedBuilder()
    .setColor(0x6a5acd)
    .setTitle("🌐 Eternity Stats By Server")
    .setDescription(desc)
    .setFooter({ text: "Server-by-server Eternity overview" });
}

/**
 * Build the main Eternity Profile pages (global, not per-guild).
 */
export async function buildEternalProfilePages(
  userId: string,
  _guildId: string, // Only used for fallback, profile is always global
  client: Client,
  discordUsername?: string,
): Promise<{ pages: EmbedBuilder[]; labels: string[] }> {
  // 1. Load or create profile (global scope)
  let profile = await loadEternalProfile(userId);
  if (!profile) {
    await ensureEternityProfile(userId, _guildId);
    profile = await loadEternalProfile(userId);
    if (!profile) throw new Error(`Failed to create Eternity Profile for ${userId}`);
  }

  const displayName = discordUsername ?? profile.username ?? 'Eternity User';
  const flamesOwned = profile.flamesOwned ?? 0;
  const currentEternity = profile.currentEternity ?? 0;
  const dungeonWins = profile.dungeonWins ?? [];
  const lastUnsealTT = profile.lastUnsealTT ?? 0;
  const unsealHistory = profile.unsealHistory ?? [];
  const lastUnseal = unsealHistory[0];
  const lastBonusTT = lastUnseal?.bonusTT ?? 0;
  const plan = await getEternityPlan(userId, _guildId);
  const plannedTarget = plan?.targetEternity ?? 'N/A';

  // --- PAGE 1: Eternity Profile (Global) ---
  const page1 = new EmbedBuilder()
    .setTitle('📜 Eternal Profile')
    .setDescription(`**${displayName}**’s Eternity overview`)
    .setColor('#00ccff')
    .addFields(
      { name: '🏆 Current Eternity', value: currentEternity.toLocaleString(), inline: true },
      { name: '📌 Target Goal', value: `${plannedTarget}`, inline: true },
      { name: '📅 Last Unseal Date', value: lastUnseal
          ? time(new Date(lastUnseal.createdAt), TimestampStyles.ShortDate)
          : 'N/A', inline: true },
      { name: '⏳ Last Unseal TT', value: `${lastUnsealTT.toLocaleString()} TT`, inline: true },
      { name: '💠 Last Bonus TT', value: `${lastBonusTT.toLocaleString()} 🌀`, inline: true },
      { name: '🔥 Flames Owned', value: flamesOwned.toLocaleString(), inline: true },
      { name: '🏰 Dungeon Wins', value: dungeonWins.length.toLocaleString(), inline: true }
    )
    .setFooter({ text: 'ParkMan Eternal Progress Tracker' })
    .setTimestamp();

  // --- PAGE 2: 90-Day Dungeon Summary ---
  const past90Days = Array.from({length:90}, (_,i)=> {
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

  // --- PAGE 3: Unseal History (last 10) ---
  const page3 = new EmbedBuilder()
    .setTitle('🔓 Your Last Unseals')
    .setColor('#ff4444')
    .setDescription(
      unsealHistory.length
        ? unsealHistory
          .slice(0, 10)
          .map(u => {
            const dateStr = time(new Date(u.createdAt), TimestampStyles.ShortDate);
            const flames  = `🔥 -${(u.flamesCost ?? 0).toLocaleString()} flames`;
            const bonus   = `🌀 +${(u.bonusTT ?? 0).toLocaleString()} TT`;
            const lvl     = `📈 E-${u.eternalityAtUnseal ?? "?"}`;
            return `:small_blue_diamond:  ${dateStr} ┃ ${flames} ┃ ${bonus} ┃ ${lvl}`;
          })
          .join('\n')
        : "You haven't unsealed yet!"
    )
    .setTimestamp();

  // --- PAGE 4: Monthly Dungeon History ---
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

  const page4 = new EmbedBuilder()
    .setTitle('📆 Monthly Dungeon History')
    .setColor('#00aaff')
    .addFields({
      name: '🗓️ Monthly Totals',
      value: monthly.length ? monthly.join('\n') : 'No dungeon data.'
    })
    .setTimestamp();

  // --- PAGE 5: By Server Breakdown ---
  const breakdownPage = await buildServerBreakdownPage(userId, client);

  return {
    pages: [page1, page2, page3, page4, breakdownPage],
    labels: ['📜 Profile', '📊 90-Day', '🔓 Unseals', '📆 Monthly', '🌐 By Server']
  };
}