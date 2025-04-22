import { EmbedBuilder } from "discord.js";

function findField(embed: any, keyword: string) {
  return embed.fields.find((f: any) =>
    f.name.toLowerCase().includes(keyword.toLowerCase())
  );
}

export function parseEternalEmbed(embed: any):
  | { eternalAT: number; eternalDEF: number; eternalLIFE: number; eternalProgress: number; lastUnsealTT: number; swordTier: number; swordLevel: number; }
  | { _error: string }
{
  try {
    const stats = findField(embed, "eternal stats")?.value;
    const progress = findField(embed, "eternal progress")?.value;
    const equip = findField(embed, "eternal equipment")?.value;

    if (!stats || !progress || !equip) {
      return { _error: "❌ Missing sections in embed. Use `rpg p e` (not just `rpg p`)." };
    }

    const statsMatch = stats.match(/E-AT\*\*: (\d+).+E-DEF\*\*: (\d+).+E-LIFE\*\*: (\d+)/s);
    const progressMatch = progress.match(/\*\*Eternality\*\*: (\d+).+\*\*Last unseal time travels\*\*: (\d+)/s);
    const equipMatch = equip.match(/sword.*\| T(\d+) Lv(\d+)/i);

    if (!statsMatch || !progressMatch) {
      return { _error: "❌ Embed parse failed. Ensure it’s from `rpg p e` not another command." };
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
    return { _error: "❌ Unexpected error. Run `prefix et reset`." };
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
  const val = findField(embed, "more items")?.value || "";
  const match = val.match(/eternity flame\*\*: ([\d,]+)/);
  return {
    eternityFlames: parseInt((match?.[1] || "0").replace(/,/g, ""))
  };
}

function flamesFromTo(start: number, end: number): number {
  let sum = 0;
  for (let i = start + 1; i <= end; i++) {
    sum += i <= 2000 ? Math.floor(50 * Math.pow(1.015, i - 200)) : 8000;
  }
  return sum;
}

function unsealCost(current: number, dungeons = 0): number {
  return 25 * Math.max(current, 200) + 25 + dungeons * 25;
}

function passiveTTBonus(eternality: number, lastUnseal: number, expected: number): number {
  const gained = expected - lastUnseal;
  return Math.max(Math.floor(eternality * gained * 3 / 2500), 0);
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

export function calculateEternalResults(eternal: any, input: any) {
  const { eternalProgress, lastUnsealTT } = eternal;
  const { targetEternality, plannedTT, tcPerDungeon } = input;

  if (targetEternality <= eternalProgress) {
    return { _error: "🎯 You already reached or exceeded this Eternality. Try a higher goal or reset with `prefix et reset`." };
  }

  const flamesToReach = flamesFromTo(eternalProgress, targetEternality);
  const ttGained = plannedTT - lastUnsealTT;
  const dungeonsNeeded = Math.ceil(flamesToReach / 500);
  const estTC = dungeonsNeeded * tcPerDungeon;
  console.log("[🧪] Predicting weapon tier for eternity:", targetEternality);
  const { tier, level } = getPredictedWeaponTier(targetEternality);
  const baseAtk = {
    1: 15900, 2: 31800, 3: 47700, 4: 63600, 5: 79500,
    6: 95400, 7: 111300, 8: 127200, 9: 143100, 10: 159000
  }[tier] || 0;

  return {
    flamesToReach,
    ttGained,
    estTC,
    dungeonsNeeded,
    estimatedRuns: Math.ceil(flamesToReach / 600),
    tcPerDungeon,
    unsealFlames: unsealCost(targetEternality, dungeonsNeeded),
    recommended: {
      name: `T${tier} Lv${level}`,
      attack: Math.floor(baseAtk * (1 + level * 0.01))
    }
  };
}

export function calculateFullInfo(
  eternal: any,
  profile: any,
  inventory: any,
  targetEternality: number,
  tcPerDungeon: number,
  expectedTT: number
) {
  const base = calculateEternalResults(eternal, {
    targetEternality,
    plannedTT: expectedTT,
    tcPerDungeon
  });

  if ("_error" in base) return base;

  const unsealFlames = unsealCost(targetEternality);
  const deficit = unsealFlames - inventory.eternityFlames;

  return {
    ...base,
    flameInventory: inventory.eternityFlames,
    unsealFlames,
    flameDeficit: deficit,
    canUnseal: deficit <= 0,
    bonusTT: passiveTTBonus(eternal.eternalProgress, eternal.lastUnsealTT, expectedTT)
  };
}

export function formatPage1(result: any) {
  return new EmbedBuilder()
    .setTitle("📊 Eternal Progress Summary")
    .setColor("#00acc1")
    .addFields(
      { name: "⛏️ Dungeons", value: `**${result.dungeonsNeeded.toLocaleString()}**`, inline: true },
      { name: "🍪 TC Cost", value: `**${result.estTC.toLocaleString()}** (${result.tcPerDungeon}×${result.dungeonsNeeded.toLocaleString()})`, inline: true },
      { name: "🔓 Unseal Cost", value: `**${result.unsealFlames.toLocaleString()}** (~${Math.ceil(result.unsealFlames / 500)} runs)`, inline: true },
      { name: "🗡️ Gear @ Goal", value: `**${result.recommended.name}**\nAtk: ${result.recommended.attack.toLocaleString()}`, inline: true }
    );
}

export function formatPage2(result: any) {
  return new EmbedBuilder()
    .setTitle("🎒 Eternal Inventory & Readiness")
    .setColor("#00acc1")
    .addFields(
      { name: "🔥 You Own", value: `**${result.flameInventory.toLocaleString()}**`, inline: true },
      { name: "🧮 Needed", value: `**${result.unsealFlames.toLocaleString()}**`, inline: true },
      { name: "❗ Deficit", value: result.flameDeficit > 0 ? `**${result.flameDeficit.toLocaleString()}**` : "✅ No Deficit", inline: true },
      { name: "📈 TT Earned Since Last Unseal", value: `**${result.ttGained?.toLocaleString() ?? "0"}**`, inline: true },
      { name: "🎁 Bonus TT", value: result.bonusTT > 0 ? `**${result.bonusTT.toLocaleString()}**` : "🔹 None", inline: true },
      { name: "✅ Can Unseal?", value: result.flameDeficit > 0 ? "🔴 No" : "🟢 Yes", inline: true }
    );
}