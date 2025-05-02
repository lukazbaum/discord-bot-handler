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
  const currentEternality = eternal.eternalProgress;

  const currentUnsealFlames = unsealCost(currentEternality);
  const futureUnsealFlames = unsealCost(targetEternity);

  const dungeonsNeeded = Math.ceil(futureUnsealFlames / 500);
  const estTC = dungeonsNeeded * tcPerDungeon;

  const baseAtkMap: Record<number, number> = {
    1: 15900, 2: 31800, 3: 47700, 4: 63600, 5: 79500,
    6: 95400, 7: 111300, 8: 127200, 9: 143100, 10: 159000
  };

  // ▶️ Projected gear at target Eternity
  const { tier: targetTier, level: targetLevel } = getPredictedWeaponTier(targetEternity);
  const targetBaseAtk = baseAtkMap[targetTier] || 0;
  const swordBaseAtk = Math.floor(targetBaseAtk * (1 + targetLevel * 0.01));
  const atkPowerNeeded = Math.floor(0.4 * swordBaseAtk);
  const atkBitePowerNeeded = Math.floor(0.52 * swordBaseAtk);

  // 📍 Current Eternity gear
  const { tier: currentTier, level: currentLevel } = getPredictedWeaponTier(currentEternality);
  const currentBaseAtk = Math.floor((baseAtkMap[currentTier] || 0) * (1 + currentLevel * 0.01));

  const ttGained = Math.max(1, expectedTT);
  const bonusTT = calcBonusTT(targetEternity, ttGained, daysSealed);

  const flameInventory = inventory.eternityFlames;
  const flameDeficit = futureUnsealFlames - flameInventory;

  return {
    currentEternality,
    targetEternity,

    // Flame costs
    currentUnsealFlames,
    futureUnsealFlames,

    // Unseal planning
    dungeonsNeeded,
    estTC,

    // Gear (future goal)
    recommended: { name: `T${targetTier} Lv${targetLevel}`, attack: swordBaseAtk },
    atkPowerNeeded,
    atkBitePowerNeeded,

    // Gear (current tier estimate)
    currentGear: { name: `T${currentTier} Lv${currentLevel}`, attack: currentBaseAtk },

    swordBaseAtk,

    // Inventory status
    flameInventory,
    flameDeficit,
    canUnseal: flameInventory >= futureUnsealFlames,

    // Plan
    bonusTT,
    ttGained,
    daysSealed,

    // Placeholder
    farmingEfficiency: Math.round(0.5 * currentEternality + 7.5)
  };
}

function classifyPlanStyle(ttPerDay: number): 'rush' | 'steady' | 'greedy' {
  if (ttPerDay >= 4) return 'greedy';
  if (ttPerDay >= 2) return 'steady';
  return 'rush';
}

function simulatePlan(targetEternity: number, style: 'rush' | 'steady' | 'greedy') {
  const scenarios = {
    rush: { tt: 50, days: 60 },
    steady: { tt: 65, days: 30 },
    greedy: { tt: 80, days: 90 }
  }[style];

  const bonusTT = calcBonusTT(targetEternity, scenarios.tt, scenarios.days);
  const ratio = bonusTT / scenarios.tt;
  return { ...scenarios, bonusTT, ratio };
}

function getStyleVariants(currentStyle: 'rush' | 'steady' | 'greedy') {
  const options: ('rush' | 'steady' | 'greedy')[] = ['rush', 'steady', 'greedy'];
  return options.filter(o => o !== currentStyle);
}

function getPlanName(style: 'rush' | 'steady' | 'greedy') {
  switch (style) {
    case 'rush': return '⚡ Rush';
    case 'steady': return '🧘 Steady';
    case 'greedy': return '🧨 Greedy';
  }
}

export function formatPagePower(result: any) {
  const currentATK = result.currentGear.attack;
  const gearName = result.currentGear.name;

  const power40Ratio = currentATK / (result.atkPowerNeeded || 1);
  const potencyPercent = Math.min(100, Math.max(0, Math.floor(power40Ratio * 40)));
  const potencyColor = potencyPercent >= 20 ? "🟢" : potencyPercent >= 10 ? "🟠" : "🔴";

  const potencyNeeded = Math.max(0, 20 - potencyPercent);
  const estimatedDungeonsForPotency = potencyNeeded > 0 ? Math.ceil(potencyNeeded / 2) : 0;

  const ttEfficiency = result.ttGained > 0 ? result.bonusTT / result.ttGained : 0;
  const ttColor = ttEfficiency >= 4 ? "🟢" : ttEfficiency >= 2 ? "🟡" : "🔴";

  const meetsPower = currentATK >= result.atkPowerNeeded;
  const meetsBite = currentATK >= result.atkBitePowerNeeded;

  return new EmbedBuilder()
    .setTitle("⚡ Eternal Unseal & Gear Success Prediction")
    .setColor("#ff7043")
    .setDescription([
      `🛡️ **Power 40%:** ${meetsPower ? "☑️ Achievable" : `❌ Needs 🗡️ ${gearName}`}`,
      `💙 **Power+Bite 52%:** ${meetsBite ? "☑️ Achievable" : `❌ Missing +${(result.atkBitePowerNeeded - currentATK).toLocaleString()} ATK`}`,
      "",
      `🔮 **Potency Success:** ${potencyColor} **${potencyPercent}%**`,
      estimatedDungeonsForPotency > 0
        ? `📈 ~**${estimatedDungeonsForPotency}** Eternal Dungeon wins needed for 20% Potency`
        : "☑️ Potency 20% ready now!",
      "",
      `🔥 **Unseal Cost (Now):** **${result.currentUnsealFlames.toLocaleString()}** flames`,
      `${ttColor} **Bonus TT / TT gained:** **${ttEfficiency.toFixed(1)}**`,
      `📈 **Total Bonus TTs at unseal:** **${result.bonusTT.toLocaleString()}**`
    ].filter(Boolean).join("\n"))
    .setTimestamp();
}

export function formatPage1(result: any) {
  const ttPerDay = result.ttGained / result.daysSealed;
  const currentStyle = classifyPlanStyle(ttPerDay);
  const currentPlan = {
    style: currentStyle,
    name: getPlanName(currentStyle),
    tt: result.ttGained,
    days: result.daysSealed,
    bonusTT: result.bonusTT,
    ratio: result.bonusTT / result.ttGained
  };

  const [alt1Style, alt2Style] = getStyleVariants(currentStyle);
  const alt1 = simulatePlan(result.targetEternity, alt1Style);
  const alt2 = simulatePlan(result.targetEternity, alt2Style);

  const betterPlan = [alt1, alt2].sort((a, b) => b.ratio - a.ratio)[0];
  const shouldSwitch = betterPlan.ratio > currentPlan.ratio;

  const betterSuggestions = findBetterSuggestions(
    currentPlan.ratio,
    result.targetEternity,
    currentPlan.tt,
    currentPlan.days
  );

  return new EmbedBuilder()
    .setTitle("📈 Eternal Sealed Progress & Bonus Planning")
    .setDescription("🔮 Grind Time Travels during sealed Eternity to maximize your Bonus TT when unsealing!")
    .setColor(result.canUnseal ? "#00cc66" : "#cc0000")
    .addFields(
      { name: "🎯 Target Eternity", value: `${result.targetEternity.toLocaleString()}`, inline: true },
      { name: "⛏️ Dungeons Needed", value: `${result.dungeonsNeeded}`, inline: true },
      { name: "🍪 Estimated TCs", value: `${result.estTC}`, inline: true },

      { name: "📘 Current Strategy", value: `${currentPlan.name} – ${currentPlan.tt} TTs over ${currentPlan.days} days → ${getEfficiencyEmoji(currentPlan.ratio)} **${currentPlan.bonusTT.toLocaleString()} Bonus TT** (${currentPlan.ratio.toFixed(2)}x)`, inline: false },

      { name: "🧪 Strategy Comparison", value: [
          `${getPlanName(alt1Style)} – ${alt1.tt} TTs over ${alt1.days} days → 💠 **${alt1.bonusTT.toLocaleString()}** (${alt1.ratio.toFixed(2)}x)`,
          `${getPlanName(alt2Style)} – ${alt2.tt} TTs over ${alt2.days} days → 💠 **${alt2.bonusTT.toLocaleString()}** (${alt2.ratio.toFixed(2)}x)`
        ].join('\n'), inline: false },

      ...(shouldSwitch ? [{
        name: "🧠 Recommended Plan",
        value: `${getPlanName(classifyPlanStyle(betterPlan.tt / betterPlan.days))} – Consider updating your plan in the database to improve efficiency.`
      }] : []),

      { name: "🧠 More Efficient", value: betterSuggestions.join("\n"), inline: false }
    )
    .setFooter({ text: "Compare your current plan with alternatives to find the most rewarding seal strategy." })
    .setTimestamp();
}

export function formatPage2(result: any) {
  const progressPercent = Math.min(100, Math.floor((result.flameInventory / result.futureUnsealFlames) * 100));
  const progressBar = createProgressBar(progressPercent);

  return new EmbedBuilder()
    .setTitle("🎒 Eternal Inventory & Readiness")
    .setColor(result.canUnseal ? "#00cc66" : "#cc0000")
    .addFields(
      { name: "🔥 Flames Owned", value: `${result.flameInventory.toLocaleString()}`, inline: true },
      { name: "🧮 Flames Needed", value: `${result.futureUnsealFlames.toLocaleString()}`, inline: true },
      { name: "📊 Flame Progress", value: `${progressBar} (${progressPercent}%)`, inline: false },
      { name: "❗ Deficit", value: result.flameDeficit > 0 ? `🔻 ${result.flameDeficit.toLocaleString()}` : "✅ No Deficit", inline: true },
      { name: "✅ Can Unseal?", value: result.canUnseal ? "🟢 Yes" : "🔴 No", inline: true }
    )
    .setFooter({ text: "Flames gathered vs needed for your next Unseal." })
    .setTimestamp();
}

export function formatPage4(result: any, profile: any) {
  const {
    targetEternity,
    futureUnsealFlames,
    recommended,
    atkPowerNeeded,
    atkBitePowerNeeded
  } = result;

  const requiredATK = recommended.attack;
  const tierLabel = recommended.name;

  const swordTier = profile.swordTier || 0;
  const swordLevel = profile.swordLevel || 0;
  const baseAtkMap: Record<number, number> = {
    1: 15900, 2: 31800, 3: 47700, 4: 63600, 5: 79500,
    6: 95400, 7: 111300, 8: 127200, 9: 143100, 10: 159000
  };
  const currentBaseAtk = Math.floor((baseAtkMap[swordTier] || 0) * (1 + swordLevel * 0.01));

  // ✅ Fixed checks
  const meetsPower = currentBaseAtk >= atkPowerNeeded;
  const meetsBite = currentBaseAtk >= atkBitePowerNeeded;

  const potencyPercent = Math.min(100, Math.floor((currentBaseAtk / atkPowerNeeded) * 40));

  const tactical = [
    `Planned Eternity Level: **${targetEternity}**`,
    `Flames Required to Unseal: **${futureUnsealFlames.toLocaleString()}**`,
    `Required Gear: **${tierLabel}** → **${requiredATK.toLocaleString()} ATK**`,
    `Power 40% Threshold: **${atkPowerNeeded.toLocaleString()} ATK**`,
    `Bite 52% Threshold: **${atkBitePowerNeeded.toLocaleString()} ATK**`
  ];

  const analytical = [
    meetsPower
      ? `✅ Your current weapon meets the 40% power threshold.`
      : `❌ You need **${atkPowerNeeded - currentBaseAtk} more ATK** to reach 40% power.`,

    meetsBite
      ? `✅ You're bite-safe (52% threshold met).`
      : `❌ You need **${atkBitePowerNeeded - currentBaseAtk} more ATK** for bite safety.`,

    `Estimated Potency if unsealed now: **${potencyPercent}%** (target: 20%)`
  ];

  return new EmbedBuilder()
    .setTitle("🚪 Eternity Exit Strategy")
    .setDescription("Plan your next unseal with confidence. Here’s what you’ll need to successfully exit at your target Eternity level.")
    .setColor(meetsPower && meetsBite ? "#00cc66" : "#ffaa00")
    .addFields(
      { name: "Tactical Requirements", value: tactical.join("\n"), inline: false },
      { name: "Readiness Analysis", value: analytical.join("\n"), inline: false }
    )
    .setFooter({ text: "Compare current weapon stats against your Eternity goal gear." })
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

