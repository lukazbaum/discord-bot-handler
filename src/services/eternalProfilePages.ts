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
  const { currentEternity = 0, flamesOwned = 0, dungeonWins = [], unsealHistory = [], lastUnsealTT = 0 } = profile;

  const lastUnseal = unsealHistory[0];
  const lastUnsealBonus = lastUnseal?.bonusTT ?? 0;
  const lastUnsealEternity = lastUnseal?.eternalityAtUnseal ?? 'N/A';

  const plan = await getEternityPlan(userId, guildId);
  const plannedTarget = plan?.targetEternity ?? 'N/A';

  let estimatedUnsealDate: Date | null = null;
  if (plan?.daysSealed && lastUnseal?.createdAt) {
    estimatedUnsealDate = new Date(new Date(lastUnseal.createdAt).getTime() + plan.daysSealed * 86400000);
  }

  // 📄 Page 1 – Profile Overview
  const page1 = new EmbedBuilder()
      .setTitle(`📜 Eternal Profile`)
      .setDescription(`**${displayName}**'s Eternity stats and progress overview.`)
      .setColor('#00ccff')
      .addFields(
          // 🔹 Section: Status
          { name: '🏆 Current Eternity', value: `${currentEternity.toLocaleString()}`, inline: true },
          { name: '📌 Target Goal', value: `${plannedTarget}`, inline: true },
          { name: '\u200b', value: '\u200b', inline: true }, // spacer for mobile formatting

          // 🔹 Section: Unseal & Rewards
          { name: '🧱 Last Unseal At', value: lastUnsealEternity.toString(), inline: true },
          { name: '💠 Last Bonus TT', value: `${lastUnsealBonus.toLocaleString()} 🌀`, inline: true },
          { name: '🔥 Flames Owned', value: `${flamesOwned.toLocaleString()}`, inline: true },

          // 🔹 Section: Combat Logs
          { name: '🏰 Dungeon Wins', value: `${dungeonWins.length.toLocaleString()}`, inline: true },
          ...(estimatedUnsealDate
              ? [{
                name: '🕓 Est. Next Unseal',
                value: `${time(estimatedUnsealDate, TimestampStyles.ShortDate)}\n(${time(estimatedUnsealDate, TimestampStyles.RelativeTime)})`,
                inline: true
              }]
              : [])
      )
      .setFooter({ text: 'ParkMan Eternal Progress Tracker' })
      .setTimestamp();

  // 🔓 Page 2 – Unseal History
  const page2 = new EmbedBuilder()
      .setTitle("🔓 Recent Eternity Unseals")
      .setColor('#ff8800')
      .setDescription(
          unsealHistory.length
              ? unsealHistory.map(u =>
                  `• **${new Date(u.createdAt).toLocaleDateString()}** → -${u.flamesCost.toLocaleString()} 🔥 / +${u.bonusTT.toLocaleString()} 🌀`
              ).join('\n')
              : "No unseals recorded yet."
      )
      .setFooter({ text: 'Tracking your path through Eternity...' })
      .setTimestamp();

  // 🐉 Page 3 – Dungeon Summary
  const summary: Record<string, { flames: number, wins: number }> = {};
  for (const win of dungeonWins) {
    const date = new Date(win.createdAt).toLocaleDateString();
    summary[date] = summary[date] || { flames: 0, wins: 0 };
    summary[date].flames += win.flamesEarned;
    summary[date].wins += 1;
  }

  const sortedDates = Object.keys(summary).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const top5 = [...sortedDates]
      .sort((a, b) => summary[b].flames - summary[a].flames)
      .slice(0, 5)
      .map(date => `• **${date}** → ${summary[date].flames.toLocaleString()} 🔥 (${summary[date].wins} win${summary[date].wins !== 1 ? 's' : ''})`);

  const allDays = sortedDates.map(date =>
      `• **${date}** → ${summary[date].flames.toLocaleString()} 🔥 (${summary[date].wins} win${summary[date].wins !== 1 ? 's' : ''})`
  );

  const page3 = new EmbedBuilder()
      .setTitle("🐉 Dungeon Wins (Daily Summary)")
      .setColor('#4caf50')
      .setDescription(
          sortedDates.length
              ? `🏆 **Top 5 Flame Days:**\n${top5.join('\n')}\n\n📆 **All Daily Records:**\n${allDays.join('\n')}`
              : "No dungeon wins recorded yet."
      )
      .setFooter({ text: 'Victory echoes across time...' })
      .setTimestamp();

  return [page1, page2, page3];
}