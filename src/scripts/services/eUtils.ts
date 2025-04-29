import { EmbedBuilder } from "discord.js";
import { getEternalUnsealHistory, addEternalPathChoice } from '/home/ubuntu/ep_bot/extras/functions.js';

function findField(embed: any, keyword: string) {
  return embed.fields.find((f: any) =>
    f.name.toLowerCase().includes(keyword.toLowerCase())
  );
}

export function extractPlayerNameFromEmbed(embed: any): string {
  return embed?.author?.name?.split("—")[0]?.trim() || "";
}

export function extractPlayerNameFromUnsealMessage(content: string): string {
  const match = content.match(/@(\S+)/);
  return match ? match[1] : "";
}


function createProgressBar(percent: number): string {
  const green = Math.floor(percent / 10);
  const yellow = (percent % 10 >= 5) ? 1 : 0;
  const black = 10 - green - yellow;
  return "🟩".repeat(green) + "🟨".repeat(yellow) + "⬛".repeat(black);
}

export function parseEternalEmbed(embed: any) {
  try {
    const stats = findField(embed, "eternal stats")?.value;
    const progress = findField(embed, "eternal progress")?.value;
    const equip = findField(embed, "eternal equipment")?.value;

    if (!stats || !progress || !equip) {
      return { _error: "❌ Missing sections in embed. Use `rpg p e`." };
    }

    const statsMatch = stats.match(/E-AT\*\*: (\d+).+E-DEF\*\*: (\d+).+E-LIFE\*\*: (\d+)/s);
    const progressMatch = progress.match(/\*\*Eternality\*\*: (\d+).+\*\*Last unseal time travels\*\*: (\d+)/s);
    const equipMatch = equip.match(/sword.*\| T(\d+) Lv(\d+)/i);

    if (!statsMatch || !progressMatch) {
      return { _error: "❌ Embed parse failed. Ensure it's from `rpg p e`." };
    }

    return {
      eternalAT: parseInt(statsMatch[1]),
      eternalDEF: parseInt(statsMatch[2]),
      eternalLIFE: parseInt(statsMatch[3]),
      eternalProgress: parseInt(progressMatch[1]),
      lastUnsealTT: parseInt(progressMatch[2]),
      swordTier: parseInt(equipMatch?.[1] || "0"),
      swordLevel: parseInt(equipMatch?.[2] || "0")
    };
  } catch {
    return { _error: "❌ Unexpected error. Run `ep et reset`." };
  }
}

export function parseProfileEmbed(embed: any) {
  const val = findField(embed, "progress")?.value || "";
  const match = val.match(/\*\*Level\*\*: (\d+).+Time travels\*\*: (\d+)/s);
  return {
    level: parseInt(match?.[1] || "0"),
    timeTravels: parseInt(match?.[2] || "0")
  };
}

export function parseInventoryEmbed(embed: any) {
  const val = findField(embed, "items")?.value || findField(embed, "more items")?.value || "";
  const match = val.match(/eternity\s*flame\*\*?:\s*([\d,]+)/i);

  return {
    eternityFlames: parseInt((match?.[1] || "0").replace(/,/g, ""))
  };
}

function unsealCost(eternality: number, dungeons = 0): number {
  return 25 * Math.max(eternality, 200) + 25 + dungeons * 25;
}

function getPredictedWeaponTier(eternity: number) {
  const start = Math.max(eternity, 200);
  let tier = 3;

  if (start >= 250) tier = 4;
  if (start >= 300) tier = 5;
  if (start >= 400) tier = 6;
  if (start >= 600) tier = 7;
  if (start >= 800) tier = 8;
  if (start >= 1200) tier = 9;
  if (start >= 1500) tier = 10;

  const tierStart = [200, 250, 300, 400, 600, 800, 1200, 1500][tier - 3] ?? 200;
  const level = Math.min(Math.floor((start - tierStart) * 0.8), 100);

  return { tier, level };
}

export async function getCurrentEternity(userId: string): Promise<number | null> {
  try {
    const history = await getEternalUnsealHistory(userId);
    if (!history.length) return null;
    const latest = history[0];
    return latest.eternityLevel || null;
  } catch (err) {
    console.error("⚠️ Error getting current Eternity:", err);
    return null;
  }
}

export function parseDungeonEmbed(embed: any) {
  try {
    const rewardsField = embed.fields?.find((f: any) => f.name.includes("Rewards"));
    if (!rewardsField) {
      return { _error: "❌ No Rewards field found in embed." };
    }

    const flamesMatch = rewardsField.value.match(/([\d,]+)\s*<:eternityflame/);
    const flamesEarned = flamesMatch ? parseInt(flamesMatch[1].replace(/,/g, '')) : 0;

    return { flamesEarned };
  } catch (err) {
    console.error("⚠️ Error parsing dungeon embed:", err);
    return { _error: "❌ Failed to parse dungeon embed." };
  }
}


export function calculateFullInfo(
  eternal: any,
  profile: any,
  inventory: any,
  targetEternality: number,
  tcPerDungeon: number,
  expectedTT: number,
  daysSealed: number = 7
) {
  const flamesNeededForUnseal = unsealCost(targetEternality);
  const dungeonsNeeded = Math.ceil(flamesNeededForUnseal / 500);
  const estTC = dungeonsNeeded * tcPerDungeon;

  const { tier, level } = getPredictedWeaponTier(targetEternality);

  const baseAtk = {
    1: 15900, 2: 31800, 3: 47700, 4: 63600, 5: 79500,
    6: 95400, 7: 111300, 8: 127200, 9: 143100, 10: 159000
  }[tier] || 0;

  const swordBaseAtk = Math.floor(baseAtk * (1 + level * 0.01));

  const atkPowerNeeded = Math.floor(0.4 * swordBaseAtk);
  const atkBitePowerNeeded = Math.floor(0.52 * swordBaseAtk);

  const ttGained = Math.max(1, expectedTT - eternal.lastUnsealTT);

  const bonusMultiplier = 1 + (daysSealed * 0.01);
  const bonusTT = Math.floor(targetEternality * (ttGained + (daysSealed / 15)) * 3 / 2500 * bonusMultiplier);

  const farmingEfficiency = Math.round(0.5 * eternal.eternalProgress + 7.5);

  return {
    currentEternality: eternal.eternalProgress,
    targetEternality,
    unsealFlames: flamesNeededForUnseal,
    dungeonsNeeded,
    estTC,
    farmingEfficiency,
    recommended: {
      name: `T${tier} Lv${level}`,
      attack: swordBaseAtk
    },
    atkPowerNeeded,
    atkBitePowerNeeded,
    swordBaseAtk,
    flameInventory: inventory.eternityFlames,
    flameDeficit: flamesNeededForUnseal - inventory.eternityFlames,
    canUnseal: inventory.eternityFlames >= flamesNeededForUnseal,
    bonusTT,
    ttGained,
    daysSealed
  };
}

export function formatPagePower(result: any) {
  const power40Ratio = result.recommended.attack / (result.atkPowerNeeded || 1);
  const potencyPercent = Math.min(100, Math.max(0, Math.floor(power40Ratio * 40)));
  const potencyColor = potencyPercent >= 20 ? "🟢" : potencyPercent >= 10 ? "🟠" : "🔴";

  const potencyNeeded = Math.max(0, 20 - potencyPercent);
  const potencyIncreasePerDungeon = 2;
  const estimatedDungeonsForPotency = potencyNeeded > 0
    ? Math.ceil(potencyNeeded / potencyIncreasePerDungeon)
    : 0;

  const ttEfficiency = (result.bonusTT / (result.ttGained || 1));
  const ttColor = ttEfficiency >= 4 ? "🟢" : ttEfficiency >= 2 ? "🟡" : "🔴";

  return new EmbedBuilder()
    .setTitle("⚡ Eternal Unseal & Gear Success Prediction")
    .setColor("#ff7043")
    .setDescription([
      `🛡️ **Power 40%:** ${result.recommended.attack < result.atkPowerNeeded ? "❌ Needs 🗡️ " + result.recommended.name : "☑️ Achievable"}`,
      `💙 **Power+Bite 52%:** ${result.recommended.attack < result.atkBitePowerNeeded ? "❌ Missing +" + (result.atkBitePowerNeeded - result.recommended.attack).toLocaleString() + " ATK" : "☑️ Achievable"}`,
      "",
      `🔮 **Potency Success:** ${potencyColor} **${potencyPercent}%**`,
      estimatedDungeonsForPotency > 0
        ? `📈 ~**${estimatedDungeonsForPotency}** Eternal Dungeon wins needed for 20% Potency`
        : "☑️ Potency 20% ready now!",
      "",
      `🔥 **Unseal Cost:** **${result.unsealFlames.toLocaleString()}** flames`,
      `${ttColor} **Bonus TT / TT gained:** **${ttEfficiency.toFixed(1)}**`,
      `📈 **Total Bonus TTs at unseal:** **${result.bonusTT.toLocaleString()}**`
    ].filter(Boolean).join("\n"))
    .setTimestamp();
}

export function formatPage1(result: any) {
  const farmingEmoji = result.farmingEfficiency >= 500 ? "🟢" : result.farmingEfficiency >= 300 ? "🟡" : "🔴";

  const progressPercent = Math.min(100, Math.floor((result.flameInventory / result.unsealFlames) * 100));
  const progressBar = createProgressBar(progressPercent);

  const bonusTTEfficiency = (result.bonusTT / (result.ttGained || 1));
  const bonusTTColor = bonusTTEfficiency >= 4 ? "🟢" : bonusTTEfficiency >= 2 ? "🟡" : "🔴";

  // 📈 TT Goal Planning Section
  const safeTTGain = 20;    // Casual player
  const optimalTTGain = 70; // Normal active player
  const aggressiveTTGain = 150; // Hard grinder

  // Bonus TT predictions
  function calculateBonusTT(ttsGained: number, daysSealed: number, eternality: number) {
    return Math.floor(eternality * (ttsGained + (daysSealed / 15)) * 3 / 2500);
  }

  const safeBonusTT = calculateBonusTT(result.ttGained + safeTTGain, result.daysSealed, result.currentEternality);
  const optimalBonusTT = calculateBonusTT(result.ttGained + optimalTTGain, result.daysSealed, result.currentEternality);
  const aggressiveBonusTT = calculateBonusTT(result.ttGained + aggressiveTTGain, result.daysSealed, result.currentEternality);

  const fields = [
    { name: "🎯 Target Eternity", value: `⚡ **${result.targetEternality.toLocaleString()}**`, inline: true },
    { name: "🔥 Unseal Flames Required", value: `🟥 **${result.unsealFlames.toLocaleString()}** flames`, inline: true },
    { name: "⛏️ Eternal Dungeons Needed (post-unseal)", value: `🟪 **${result.dungeonsNeeded.toLocaleString()}** runs`, inline: true },
    { name: "🍪 Estimated Time Cookies", value: `🟨 **${result.estTC.toLocaleString()}** cookies`, inline: true },
    { name: "🏹 Farming Efficiency", value: `${farmingEmoji} **${result.farmingEfficiency.toLocaleString()} flames/run**`, inline: true },
    { name: "📊 Flame Progress", value: `${progressBar} (${progressPercent}%)`, inline: false },
    { name: "📈 Bonus TT Efficiency", value: `${bonusTTColor} **${bonusTTEfficiency.toFixed(1)} bonus TTs / TT gained**`, inline: true },
    { name: "🧮 Recommended TT Goals", value: [
        `🐢 Safe ➔ +${safeTTGain} TTs ➔ 📈 ~**${safeBonusTT}** Bonus TTs`,
        `🐇 Optimal ➔ +${optimalTTGain} TTs ➔ 📈 ~**${optimalBonusTT}** Bonus TTs`,
        `🦅 Aggressive ➔ +${aggressiveTTGain} TTs ➔ 📈 ~**${aggressiveBonusTT}** Bonus TTs`
      ].join("\n"), inline: false }
  ];

  return new EmbedBuilder()
    .setTitle("📈 Eternal Sealed Progress & Bonus Planning")
    .setDescription("🔮 Grind Time Travels during sealed Eternity to maximize your Bonus TT when unsealing!")
    .setColor(result.canUnseal ? "#00cc66" : "#cc0000")
    .addFields(fields)
    .setFooter({ text: "⚡ Plan based on your own TT grinding effort. No boosts assumed." })
    .setTimestamp();
}

export function formatPage2(result: any) {
  const progressPercent = Math.min(100, Math.floor((result.flameInventory / result.unsealFlames) * 100));
  const progressBar = createProgressBar(progressPercent);

  const extraDungeonsNeeded = result.flameDeficit > 0 ? Math.ceil(result.flameDeficit / 500) : 0;

  const fields = [
    { name: "🔥 Flames Owned", value: `🟥 **${result.flameInventory.toLocaleString()}**`, inline: true },
    { name: "🧮 Flames Needed", value: `🟥 **${result.unsealFlames.toLocaleString()}**`, inline: true },
    { name: "📊 Flame Progress", value: `${progressBar} (${progressPercent}%)`, inline: false },
    { name: "❗ Deficit", value: result.flameDeficit > 0 ? `🔻 **${result.flameDeficit.toLocaleString()}**` : "✅ No Deficit", inline: true },
    { name: "✅ Can Unseal?", value: result.canUnseal ? "🟢 Yes" : "🔴 No", inline: true }
  ];


  return new EmbedBuilder()
    .setTitle("🎒 Eternal Inventory & Readiness")
    .setColor(result.canUnseal ? "#00cc66" : "#cc0000")
    .addFields(fields)
    .setFooter({ text: "Flames gathered vs needed for your next Unseal." })
    .setTimestamp();
}