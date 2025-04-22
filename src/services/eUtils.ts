import { EmbedBuilder } from "discord.js";

export function parseEternalEmbed(embed: any) {
  const statsField = embed.fields.find((f: any) => f.name.includes("ETERNAL STATS"));
  const progressField = embed.fields.find((f: any) => f.name.includes("ETERNAL PROGRESS"));
  const equipField = embed.fields.find((f: any) => f.name.includes("ETERNAL EQUIPMENT"));

  if (!statsField || !progressField || !equipField) {
    throw new Error("❌ Embed is missing required Eternal fields");
  }

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
    sum += Math.floor(50 * Math.pow(1.015, i - 200));
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
  if (eternity < 200) return { tier: 3, level: 0 }; // ensure floor bound

  const tierIndex = Math.floor((eternity - 200) / 25);
  const tier = Math.max(3 + tierIndex, 3);
  const tierStart = 200 + tierIndex * 25;
  const level = Math.min(Math.floor((eternity - tierStart) * 0.8), 20);

  return {
    tier,
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
  const estimatedRuns = Math.ceil(flamesToReach / 600);
  const estTC = dungeonsNeeded * tcPerDungeon;

  const { tier, level } = getPredictedWeaponTier(targetEternality);
  const base: Record<number, number> = {
    1: 15900, 2: 31800, 3: 47700, 4: 63600, 5: 79500,
    6: 95400, 7: 111300, 8: 127200, 9: 143100, 10: 159000,
    11: 174900, 12: 190800, 13: 198750, 14: 210000, 15: 221250,
    16: 232500, 17: 243750, 18: 255000, 19: 266250, 20: 277500,
    21: 288750, 22: 300000, 23: 311250, 24: 322500, 25: 333750,
    26: 345000, 27: 356250, 28: 367500, 29: 378750, 30: 390000
  };
  const baseAtk = base[tier] || 0;
  const atk = Math.floor(baseAtk * (1 + level * 0.05));

  return {
    flamesToReach,
    ttGained,
    estTC,
    dungeonsNeeded,
    estimatedRuns,
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
      { name: "📈 XP Needed", value: `**${result.flamesToReach}**`, inline: true },
      { name: "⛏️ Dungeons", value: `**${result.dungeonsNeeded}**`, inline: true },
      {
        name: "🍪 TC Cost",
        value: `**${result.estTC}** (${result.tcPerDungeon}×${result.dungeonsNeeded})`,
        inline: true
      },
      {
        name: "🔓 Unseal Cost",
        value: `**${result.unsealFlames}** (~${Math.ceil(result.unsealFlames / 500)} runs)`,
        inline: true
      },
      {
        name: "🗡️ Gear @ Goal",
        value: `**${result.recommended.name}**\nAtk: ${result.recommended.attack}`,
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
      { name: "🔥 You Own", value: `**${result.flameInventory}**`, inline: true },
      { name: "🧮 Needed", value: `**${result.unsealFlames}**`, inline: true },
      {
        name: "❗ Deficit",
        value: result.flameDeficit > 0 ? `**${result.flameDeficit}**` : "✅ No Deficit",
        inline: true
      },
      { name: "📈 TT Earned Since Last Unseal", value: `**${result.ttGained ?? 0}**`, inline: true },
      { name: "🎁 Bonus TT", value: result.bonusTT > 0 ? `**${result.bonusTT}**` : "🔹 None", inline: true },
      {
        name: "✅ Can Unseal?",
        value: result.flameDeficit > 0 ? "🔴 No" : "🟢 Yes",
        inline: true
      }
    );
  return embed;
}