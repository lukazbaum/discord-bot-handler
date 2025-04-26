import { EmbedBuilder } from "discord.js";

function findField(embed: any, keyword: string) {
  return embed.fields.find((f: any) =>
    f.name.toLowerCase().includes(keyword.toLowerCase())
  );
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
  const val = findField(embed, "more items")?.value || "";
  const match = val.match(/eternity flame\*\*: ([\d,]+)/);
  return {
    eternityFlames: parseInt((match?.[1] || "0").replace(/,/g, ""))
  };
}

function flamesFromTo(start: number, end: number): number {
  let sum = 0;
  for (let i = start + 1; i <= end; i++) {
    if (i <= 200) {
      sum += 50;
    } else if (i <= 2000) {
      sum += Math.floor(50 * Math.pow(1.015, i - 200));
    } else {
      sum += 8000;
    }
  }
  return sum;
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

  // 🔥 THE FIX: calculate real ttGained
  const ttGained = Math.max(1, expectedTT - eternal.lastUnsealTT);

  const bonusMultiplier = 1 + (daysSealed * 0.01);
  const bonusTT = Math.floor(targetEternality * (ttGained + (daysSealed / 15)) * 3 / 2500 * bonusMultiplier);

  return {
    currentEternality: eternal.eternalProgress,
    targetEternality,
    unsealFlames: flamesNeededForUnseal,
    dungeonsNeeded,
    estTC,
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
    ttGained
  };
}

export function formatPagePower(result: any) {
  const power40Ratio = result.recommended.attack / (result.atkPowerNeeded || 1);
  const powerBiteRatio = result.recommended.attack / (result.atkBitePowerNeeded || 1);

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
      result.recommended.attack < result.atkPowerNeeded
        ? `❌ To Power [40% success], you need 🗡️ **${result.recommended.name}**.`
        : "☑️ Power [40% success] achievable!",
      result.recommended.attack < result.atkBitePowerNeeded
        ? `❌ To Power+Bite [52% success], you need 💙 **+${(result.atkBitePowerNeeded - result.recommended.attack).toLocaleString()}** more attack.`
        : "☑️ Power+Bite [52% success] achievable!",
      `🔮 Estimated potency success: ${potencyColor} **${potencyPercent}%**`,
      estimatedDungeonsForPotency > 0
        ? `📈 ~**${estimatedDungeonsForPotency}** more Eternal Dungeon wins needed for 20% Potency!`
        : "☑️ Potency 20% success achievable now!",
      `🔥 Unseal cost: **${result.unsealFlames.toLocaleString()}** flames`,
      `📈 Bonus TT per TT gained:  **${ttEfficiency.toFixed(1)}**`,
      `📈 Total Bonus TTs at unseal: **${result.bonusTT.toLocaleString()}**`,
      potencyPercent < 10 ? "⚠️ Warning: Very low potency success! Consider farming Eternal Dungeons or enchanting gear." : "",
    ].filter(line => line !== "").join("\n"));
}

export function formatPage1(result: any) {
  return new EmbedBuilder()
    .setTitle("📈 Eternal Unseal Planning Summary")
    .setColor("#00acc1")
    .addFields(
      { name: "🛡️ Target Eternity", value: `**${result.targetEternality}**`, inline: true },
      { name: "🔥 Flames Needed to Unseal", value: `**${result.unsealFlames.toLocaleString()}** flames`, inline: true },
      { name: "⛏️ Eternal Dungeons Needed (while unsealed)", value: `**${result.dungeonsNeeded.toLocaleString()}** wins`, inline: true },
      { name: "🍪 Estimated Time Cookies Needed", value: `**${result.estTC.toLocaleString()}** cookies`, inline: true }
    )
    .setFooter({ text: "Dungeons counted are Eternal Dungeons during Unsealed period — to farm flames for next Unseal." });
}
export function formatPage2(result: any) {
  return new EmbedBuilder()
    .setTitle("🎒 Eternal Inventory & Readiness")
    .setColor("#00acc1")
    .addFields(
      { name: "🔥 Flames Owned", value: `**${result.flameInventory.toLocaleString()}**`, inline: true },
      { name: "🧮 Flames Needed", value: `**${result.unsealFlames.toLocaleString()}**`, inline: true },
      { name: "❗ Deficit", value: result.flameDeficit > 0 ? `**${result.flameDeficit.toLocaleString()}**` : "✅ No Deficit", inline: true },
      { name: "✅ Can Unseal?", value: result.canUnseal ? "🟢 Yes" : "🔴 No", inline: true }
    );
}