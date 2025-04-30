import { EmbedBuilder } from "discord.js";
import { getEternalUnsealHistory } from '/home/ubuntu/ep_bot/extras/functions.js';

/** -------------------------------------
 * 🧩 Parsing Utility Functions
 * ----------------------------------- */

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

/** -------------------------------------
 * 🔍 Embed Parsers
 * ----------------------------------- */

export function parseEternalEmbed(embed: any) {
  try {
    const stats = findField(embed, "eternal stats")?.value || "";
    const progress = findField(embed, "eternal progress")?.value || "";
    const equip = findField(embed, "eternal equipment")?.value || "";

    const statsMatch = stats.match(/E-AT\*\*: (\d+).+E-DEF\*\*: (\d+).+E-LIFE\*\*: (\d+)/s);
    const progressMatch = progress.match(/\*\*Eternality\*\*: (\d+).+\*\*Last unseal time travels\*\*: (\d+)/s);
    const swordMatch = equip.match(/sword.*\| T(\d+) Lv(\d+)/i);
    const armorMatch = equip.match(/armor.*\| T(\d+) Lv(\d+)/i);

    if (!statsMatch || !progressMatch) return { _error: "Missing key data from embed" };

    return {
      eternalAT: parseInt(statsMatch[1]),
      eternalDEF: parseInt(statsMatch[2]),
      eternalLIFE: parseInt(statsMatch[3]),
      eternalProgress: parseInt(progressMatch[1]),
      lastUnsealTT: parseInt(progressMatch[2]),
      swordTier: swordMatch ? parseInt(swordMatch[1]) : 0,
      swordLevel: swordMatch ? parseInt(swordMatch[2]) : 0,
      armorTier: armorMatch ? parseInt(armorMatch[1]) : 0,
      armorLevel: armorMatch ? parseInt(armorMatch[2]) : 0
    };
  } catch {
    return { _error: "Error parsing embed" };
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
  return { eternityFlames: parseInt((match?.[1] || "0").replace(/,/g, "")) };
}

export function parseDungeonEmbed(embed: any) {
  try {
    const rewardsField = embed.fields?.find((f: any) => f.name.toLowerCase().includes("rewards"));
    if (!rewardsField) return { _error: "❌ No Rewards field found in embed." };

    const flamesMatch = rewardsField.value.match(/([\d,]+)\s*<:eternityflame/i);
    return { flamesEarned: flamesMatch ? parseInt(flamesMatch[1].replace(/,/g, '')) : 0 };
  } catch {
    return { _error: "❌ Failed to parse dungeon embed." };
  }
}

/** -------------------------------------
 * ⌛ Eternity Utility
 * ----------------------------------- */

export async function getCurrentEternity(userId: string): Promise<number | null> {
  try {
    const history = await getEternalUnsealHistory(userId);
    return history.length ? history[0].eternityLevel || null : null;
  } catch (err) {
    console.error("⚠️ Error getting current Eternity:", err);
    return null;
  }
}

/** -------------------------------------
 * 📈 Prediction Core Calculation
 * ----------------------------------- */

function unsealCost(eternality: number): number {
  return 25 * Math.max(eternality, 200) + 25;
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

function calcBonusTT(eternity: number, tt: number, days: number): number {
  if (!eternity || !tt || !days) return 0;
  const bonusMultiplier = 1 + (days * 0.01);
  return Math.floor(eternity * (tt + (days / 15)) * 3 / 2500 * bonusMultiplier);
}

function getEfficiencyEmoji(ratio: number): string {
  if (ratio >= 4.0) return "💎";
  if (ratio >= 2.5) return "⭐";
  if (ratio >= 1.4) return "🔹";
  return "❌";
}

export function calculateFullInfo(
  eternal: any,
  profile: any,
  inventory: any,
  targetEternity: number,
  tcPerDungeon: number,
  expectedTT: number,
  daysSealed: number = 7
) {
  const flamesNeededForUnseal = unsealCost(targetEternity);
  const dungeonsNeeded = Math.ceil(flamesNeededForUnseal / 500);
  const estTC = dungeonsNeeded * tcPerDungeon;

  const { tier, level } = getPredictedWeaponTier(targetEternity);
  const baseAtk = { 1: 15900, 2: 31800, 3: 47700, 4: 63600, 5: 79500, 6: 95400, 7: 111300, 8: 127200, 9: 143100, 10: 159000 }[tier] || 0;
  const swordBaseAtk = Math.floor(baseAtk * (1 + level * 0.01));
  const atkPowerNeeded = Math.floor(0.4 * swordBaseAtk);
  const atkBitePowerNeeded = Math.floor(0.52 * swordBaseAtk);
  const ttGained = Math.max(1, expectedTT);
  const bonusTT = calcBonusTT(targetEternity, ttGained, daysSealed);
  const farmingEfficiency = Math.round(0.5 * eternal.eternalProgress + 7.5);

  return {
    currentEternality: eternal.eternalProgress,
    targetEternity,
    unsealFlames: flamesNeededForUnseal,
    dungeonsNeeded,
    estTC,
    farmingEfficiency,
    recommended: { name: `T${tier} Lv${level}`, attack: swordBaseAtk },
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



// ────── Embed Formatters ──────

export function formatPage1(result: any) {
  const progressPercent = Math.min(100, Math.floor((result.flameInventory / result.unsealFlames) * 100));
  const progressBar = createProgressBar(progressPercent);

  const bonusTTEfficiency = result.ttGained > 0 ? result.bonusTT / result.ttGained : 0;
  const efficiencyEmoji = getEfficiencyEmoji(bonusTTEfficiency);

  const planLine = `${efficiencyEmoji} ${result.bonusTT.toLocaleString()} Bonus TT from ${result.ttGained} TTs in ${result.daysSealed} days (${bonusTTEfficiency.toFixed(2)}x)`;

  const betterSuggestions = findBetterSuggestions(
    bonusTTEfficiency,
    result.targetEternity,
    result.ttGained,
    result.daysSealed
  );

  return new EmbedBuilder()
    .setTitle("📈 Eternal Sealed Progress & Bonus Planning")
    .setDescription("🔮 Grind Time Travels during sealed Eternity to maximize your Bonus TT when unsealing!")
    .setColor(result.canUnseal ? "#00cc66" : "#cc0000")
    .addFields(
      { name: "🎯 Target Eternity", value: `${result.targetEternity.toLocaleString()}`, inline: true },
      { name: "⛏️ Dungeons Needed", value: `${result.dungeonsNeeded}`, inline: true },
      { name: "🍪 Estimated TCs", value: `${result.estTC}`, inline: true },
      { name: "📈 Bonus TT (Plan)", value: planLine, inline: false },
      { name: "🧠 More Efficient Plans", value: betterSuggestions.join("\n"), inline: false }
    )
    .setFooter({ text: "💡 Showing only plans that yield a better Bonus TT per TT than your current plan." })
    .setTimestamp();
}

export function formatPage2(result: any) {
  const progressPercent = Math.min(100, Math.floor((result.flameInventory / result.unsealFlames) * 100));
  const progressBar = createProgressBar(progressPercent);
  const extraDungeonsNeeded = result.flameDeficit > 0 ? Math.ceil(result.flameDeficit / 500) : 0;

  return new EmbedBuilder()
    .setTitle("🎒 Eternal Inventory & Readiness")
    .setColor(result.canUnseal ? "#00cc66" : "#cc0000")
    .addFields(
      { name: "🔥 Flames Owned", value: `${result.flameInventory.toLocaleString()}`, inline: true },
      { name: "🧮 Flames Needed", value: `${result.unsealFlames.toLocaleString()}`, inline: true },
      { name: "📊 Flame Progress", value: `${progressBar} (${progressPercent}%)`, inline: false },
      { name: "❗ Deficit", value: result.flameDeficit > 0 ? `🔻 ${result.flameDeficit.toLocaleString()}` : "✅ No Deficit", inline: true },
      { name: "✅ Can Unseal?", value: result.canUnseal ? "🟢 Yes" : "🔴 No", inline: true }
    )
    .setFooter({ text: "Flames gathered vs needed for your next Unseal." })
    .setTimestamp();
}

export function formatPagePower(result: any) {
  const power40Ratio = result.recommended.attack / (result.atkPowerNeeded || 1);
  const potencyPercent = Math.min(100, Math.max(0, Math.floor(power40Ratio * 40)));
  const potencyColor = potencyPercent >= 20 ? "🟢" : potencyPercent >= 10 ? "🟠" : "🔴";

  const potencyNeeded = Math.max(0, 20 - potencyPercent);
  const estimatedDungeonsForPotency = potencyNeeded > 0 ? Math.ceil(potencyNeeded / 2) : 0;

  const ttEfficiency = result.ttGained > 0 ? result.bonusTT / result.ttGained : 0;
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

// ────── Suggestion Logic ──────

function findBetterSuggestions(
  currentRatio: number,
  targetEternity: number,
  currentTT: number,
  currentDays: number
): string[] {
  const suggestions: { ratio: number, display: string }[] = [];

  for (let days = Math.max(currentDays - 15, 30); days <= currentDays + 30; days += 5) {
    for (let tt = Math.max(currentTT - 25, 20); tt <= currentTT + 50; tt += 5) {
      const bonus = calcBonusTT(targetEternity, tt, days);
      const ratio = bonus / tt;

      if (ratio > currentRatio) {
        const emoji = getEfficiencyEmoji(ratio);
        const display = `${emoji} ${bonus.toLocaleString()} Bonus TT from ${tt} TTs in ${days} days (${ratio.toFixed(2)}x)`;
        suggestions.push({ ratio, display });
      }
    }
  }

  // Sort by best ratio, remove duplicates
  const unique = new Map();
  for (const s of suggestions.sort((a, b) => b.ratio - a.ratio)) {
    if (!unique.has(s.display)) unique.set(s.display, s);
  }

  const top = Array.from(unique.values()).slice(0, 3);
  if (!top.length) return ["⚠️ No better plans found."];

  top[0].display = `**${top[0].display}**`;
  return top.map(t => t.display);
}