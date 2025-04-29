import { EmbedBuilder } from 'discord.js';
import { loadEternalProfile, ensureEternityProfile } from './eternityProfile';

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

  const dungeonWinsCount = profile.dungeonWins?.length ?? 0;
  const flamesOwned = profile.flamesOwned ?? 0;
  const lastUnsealTT = profile.lastUnsealTT ?? 0;
  const unsealHistory = profile.unsealHistory ?? [];
  const displayName = discordUsername || "Eternity User";

  const page1 = new EmbedBuilder()
    .setTitle(`📜 Eternal Profile for ${displayName}`)
    .setColor('#00ccff')
    .addFields(
      { name: '🏆 Current Eternality', value: `${profile.currentEternity.toLocaleString()}`, inline: true },
      { name: '🧱 Eternity at Last Unseal', value: unsealHistory[0]?.eternalityAtUnseal?.toLocaleString() || 'N/A', inline: true },
      { name: '🔥 Flames Owned', value: `${flamesOwned.toLocaleString()}`, inline: true },
      { name: '🏰 Total Dungeon Wins', value: `${dungeonWinsCount.toLocaleString()}`, inline: true },
      { name: '🕰️ Last Unseal Bonus TT', value: `${lastUnsealTT.toLocaleString()}`, inline: true },
      { name: '🎯 Path Plan', value: profile.pathChoice?.chosenPath || 'N/A', inline: true },
      { name: '🚀 Target Eternality', value: `${profile.pathChoice?.targetEternity?.toLocaleString() || 'N/A'}`, inline: true }
    )
    .setFooter({ text: 'ParkMan Eternal Progress Tracker' })
    .setTimestamp();

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

  const dailyDungeonSummary: Record<string, { flames: number; wins: number }> = {};

  for (const win of profile.dungeonWins ?? []) {
    const dateKey = new Date(win.createdAt).toLocaleDateString();
    if (!dailyDungeonSummary[dateKey]) {
      dailyDungeonSummary[dateKey] = { flames: 0, wins: 0 };
    }
    dailyDungeonSummary[dateKey].flames += win.flamesEarned;
    dailyDungeonSummary[dateKey].wins += 1;
  }

  const page3 = new EmbedBuilder()
      .setTitle(`🐉 Dungeon Wins (Daily Summary)`)
      .setColor('#4caf50')
      .setDescription(Object.entries(dailyDungeonSummary).length
          ? Object.entries(dailyDungeonSummary)
              .map(([date, { flames, wins }]) =>
                  `• **${date}** → ${flames.toLocaleString()} 🔥 (${wins} win${wins !== 1 ? 's' : ''})`
              ).join('\n')
          : "No dungeon wins recorded yet."
      )
      .setFooter({ text: 'Victory echoes across time...' })
      .setTimestamp();

  return [page1, page2, page3];
}