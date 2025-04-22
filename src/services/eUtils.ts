// src/services/eUtils.ts

import { EmbedBuilder } from "discord.js";

export function parseEternalEmbed(embed: any) {
  const statsField = embed.fields.find((f: any) => f.name.includes("ETERNAL STATS"));
  const progressField = embed.fields.find((f: any) => f.name.includes("ETERNAL PROGRESS"));
  const equipField = embed.fields.find((f: any) => f.name.includes("ETERNAL EQUIPMENT"));

  if (!statsField || !progressField || !equipField) throw new Error("❌ Embed is missing required Eternal fields");

  const stats = statsField.value;
  const progress = progressField.value;
  const equip = equipField.value;

  const match = stats.match(/E-AT\*\*: (\d+).+E-DEF\*\*: (\d+).+E-LIFE\*\*: (\d+)/s);
  if (!match) throw new Error("❌ Failed to parse ETERNAL STATS");

  const progressMatch = progress.match(/\*\*Eternality\*\*: (\d+).+\*\*Last unseal time travels\*\*: (\d+)/s);
  if (!progressMatch) throw new Error("❌ Failed to parse ETERNAL PROGRESS");

  const [eternality, lastUnseal] = progressMatch.slice(1);
  const swordMatch = equip.match(/sword.*\| T(\d+) Lv(\d+)/i);

  return {
    eternalAT: parseInt(match[1]),
    eternalDEF: parseInt(match[2]),
    eternalLIFE: parseInt(match[3]),
    eternalProgress: parseInt(eternality),
    lastUnsealTT: parseInt(lastUnseal),
    swordTier: parseInt(swordMatch?.[1] || "0"),
    swordLevel: parseInt(swordMatch?.[2] || "0")
  };
}

export function parseProfileEmbed(embed: any) {
  const profile = embed.fields.find((f: any) => f.name === "PROGRESS")?.value || "";
  const match = profile.match(/\*\*Level\*\*: (\d+).+Time travels\*\*: (\d+)/s);
  return {
    level: parseInt(match?.[1] || "0"),
    timeTravels: parseInt(match?.[2] || "0")
  };
}

export function parseInventoryEmbed(embed: any) {
  const inv = embed.fields.find((f: any) => f.name.includes("More items"))?.value || "";
  const match = inv.match(/eternity flame\*\*: ([\d,]+)/);
  return {
    eternityFlames: parseInt((match?.[1] || "0").replace(/,/g, ""))
  };
}

function flamesFromTo(start: number, end: number): number {
  let sum = 0;
  for (let i = start + 1; i <= end; i++) {
    const capped = Math.min(i, 2000);
    sum += Math.floor(50 * Math.pow(1.015, capped - 200));
  }
  return sum;
}

function unsealCost(eternalProgress: number, dungeons: number = 0): number {
  const safeEternity = Math.max(eternalProgress, 200);
  return 25 * safeEternity + 25 + (dungeons * 25);
}

function passiveTTBonus(eternality: number, lastUnsealTT: number, expectedTT: number): number {
  const ttGained = expectedTT - lastUnsealTT;
  return Math.max(Math.floor(eternality * ttGained * 3 / 2500), 0);
}

function getPredictedWeaponTier(eternity: number) {
  const capped = Math.min(eternity, 3000);
  const tier = Math.floor((capped - 200) / 25) + 3;
  const tierStart = Math.floor((capped - 200) / 25) * 25 + 200;
  const level = Math.min(Math.floor((capped - tierStart) * 0.8), 99);
  return {
    tier: Math.max(tier, 3),
    level
  };
}

export function calculateEternalResults(eternal: any, input: any) {
  const { eternalProgress, lastUnsealTT } = eternal;
  const { targetEternality, plannedTT, tcPerDungeon } = input;

  if (targetEternality <= eternalProgress) throw new Error("Already reached this goal");

  const flamesToReach = flamesFromTo(eternalProgress, targetEternality);
  const ttGained = plannedTT - lastUnsealTT;
  const dungeonsNeeded = Math.ceil(flamesToReach / 500);
  const estTC = dungeonsNeeded * tcPerDungeon;

  const { tier, level } = getPredictedWeaponTier(targetEternality);
  const base: Record<number, number> = {};
  for (let t = 1; t <= 30; t++) base[t] = 15900 * t;

  const baseAtk = base[tier] || 0;
  const atk = Math.floor(baseAtk * (1 + level * 0.05));

  return {
    flamesToReach,
    ttGained,
    estTC,
    dungeonsNeeded,
    tcPerDungeon,
    unsealFlames: unsealCost(targetEternality, dungeonsNeeded),
    recommended: {
      name: `T${tier} Lv${level}`,
      attack: atk
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
  const embed = new EmbedBuilder()
    .setTitle("📊 Eternal Progress Summary")
    .setColor("#00acc1")
    .addFields(
      { name: "⛏️ Dungeons", value: `**${result.dungeonsNeeded.toLocaleString()}**`, inline: true },
      {
        name: "🍪 TC Cost",
        value: `**${result.estTC.toLocaleString()}** (${result.tcPerDungeon}×${result.dungeonsNeeded.toLocaleString()})`,
        inline: true
      },
      {
        name: "🔓 Unseal Cost",
        value: `**${result.unsealFlames.toLocaleString()}** (~${Math.ceil(result.unsealFlames / 500).toLocaleString()} runs)`,
        inline: true
      },
      {
        name: "🗡️ Gear @ Goal",
        value: `**${result.recommended.name}**\nAtk: ${result.recommended.attack.toLocaleString()}`,
        inline: true
      }
    );
  return embed;
}

export function formatPage2(result: any) {
  const embed = new EmbedBuilder()
    .setTitle("🎒 Eternal Inventory & Readiness")
    .setColor("#00acc1")
    .addFields(
      { name: "🔥 You Own", value: `**${result.flameInventory.toLocaleString()}**`, inline: true },
      { name: "🧮 Needed", value: `**${result.unsealFlames.toLocaleString()}**`, inline: true },
      {
        name: "❗ Deficit",
        value: result.flameDeficit > 0
          ? `**${result.flameDeficit.toLocaleString()}**`
          : "✅ No Deficit",
        inline: true
      },
      {
        name: "📈 TT Earned Since Last Unseal",
        value: `**${result.ttGained?.toLocaleString() ?? "0"}**`,
        inline: true
      },
      {
        name: "🎁 Bonus TT",
        value: result.bonusTT > 0
          ? `**${result.bonusTT.toLocaleString()}**`
          : "🔹 None",
        inline: true
      },
      {
        name: "✅ Can Unseal?",
        value: result.flameDeficit > 0 ? "🔴 No" : "🟢 Yes",
        inline: true
      }
    );
  return embed;
}