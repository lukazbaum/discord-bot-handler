const {
  addEternalPathChoice,
  getEternalPathChoice,
  updateEternalPathChoice
} = require('/home/ubuntu/ep_bot/extras/functions');

import { EmbedBuilder, Message, Guild } from "discord.js";


export async function getDisplayTitle(userId: string, currentEternity: number): Promise<string> {
  const unlockedTitles = getUnlockedTitles(currentEternity);
  return unlockedTitles[0] || "Intern of the First Flame";
}

export async function setDisplayTitle(userId: string, title: string): Promise<void> {
  try {
    await addEternalPathChoice(userId, title);
  } catch (err) {
    console.error("⚠️ Error saving title:", err);
  }
}

export async function tryFindUserIdByName(guild: Guild, username: string): Promise<string | null> {
  try {
    const fetched = await guild.members.fetch({ query: username, limit: 1 });
    const match = fetched.find(member =>
        member.user.username.toLowerCase() === username.toLowerCase() ||
        member.displayName.toLowerCase() === username.toLowerCase()
    );

    if (match) return match.user.id;
    return null;
  } catch (err: any) {
    if (err.code === 'GuildMembersTimeout') {
      console.warn(`⏱️ Timeout fetching members in ${guild.name} when looking for ${username}`);
      return null;
    }
    console.error("❌ Unexpected error fetching member:", err);
    return null;
  }
}

export function getUnlockedTitles(currentEternity: number): string[] {
  const titles = [
    { threshold: 1, title: "Intern of the First Flame" },
    { threshold: 10, title: "Flamewalker" },
    { threshold: 25, title: "Seeker of Ash" },
    { threshold: 50, title: "Knight of the Eternal Crest" },
    { threshold: 100, title: "Acolyte of Embers" },
    { threshold: 200, title: "Flameborne Champion" },
    { threshold: 400, title: "Ashen Hero" },
    { threshold: 600, title: "Guardian of Sealed Eternities" },
    { threshold: 800, title: "Dragonsoul Warden" },
    { threshold: 1000, title: "Herald of Endless Time" },
    { threshold: 1500, title: "Eternal Flame Sovereign" },
    { threshold: 2000, title: "Master of the Last Dawn" },
    { threshold: 3000, title: "Godfire Ascendant" },
    { threshold: 5000, title: "Infinite Eternity Wanderer" },
    { threshold: 7500, title: "Timeless Conqueror" },
    { threshold: 10000, title: "Lord of a Thousand Flames" }
  ];

  return titles
    .filter(t => currentEternity >= t.threshold)
    .map(t => t.title)
    .reverse();
}

export function getTitleLore(title: string): string {
  const lores: { [key: string]: string } = {
    "Intern of the First Flame": "Still figuring out where the fire button is...",
    "Flamewalker": "Treading lightly over burning paths.",
    "Seeker of Ash": "What once burned now guides you.",
    "Knight of the Eternal Crest": "Defender of forgotten embers.",
    "Acolyte of Embers": "Lighting hope from fading ashes.",
    "Flameborne Champion": "Victorious from fire's trial.",
    "Ashen Hero": "Risen from ruin and soot.",
    "Guardian of Sealed Eternities": "Protector of the timeless prisons.",
    "Dragonsoul Warden": "Bound to ancient fire.",
    "Herald of Endless Time": "Announcing eternity's echo.",
    "Eternal Flame Sovereign": "Crowned by infernal glory.",
    "Master of the Last Dawn": "Where sunrise no longer reigns.",
    "Godfire Ascendant": "A pyre eternal blazes within.",
    "Infinite Eternity Wanderer": "A traveler lost to infinity.",
    "Timeless Conqueror": "Neverending wars, neverending victories.",
    "Lord of a Thousand Flames": "Rule over the blazing realm."
  };
  return lores[title] || "An unsung legend of Eternity.";
}

function getNextTitleTarget(currentEternity: number) {
  const milestones = [
    { threshold: 300, title: "Professional Horizon Chaser" },
    { threshold: 600, title: "Manager of Lost Cycles" },
    { threshold: 900, title: "Senior Rift Breaker" },
    { threshold: 1200, title: "Regional Champion of Shattered Realms" },
    { threshold: 1500, title: "Vice President of Infinite Tapestry" },
    { threshold: 1800, title: "CEO of Silent Stars Inc." },
    { threshold: 2000, title: "Grand Architect of Absolutely Everything™" },
    { threshold: 5000, title: "Director of Temporal Shenanigans" },
    { threshold: 10000, title: "Lord of the Recursive Multiverse" },
    { threshold: 15000, title: "Supreme Overseer of All That Breathes" },
    { threshold: 20000, title: "Cosmic Bugfixer of the Void" },
    { threshold: 25000, title: "Chairman of Ultimate Existential Crisis" }
  ];

  for (const milestone of milestones) {
    if (currentEternity < milestone.threshold) {
      return milestone;
    }
  }
  return null;
}

function createProgressBar(percent: number) {
  const green = Math.floor(percent / 10);
  const yellow = (percent % 10 >= 5) ? 1 : 0;
  const black = 10 - green - yellow;
  return "🟩".repeat(green) + "🟨".repeat(yellow) + "⬛".repeat(black);
}

export function tryExtractUserIdFromMessage(message: Message): string | null {
  if (!message) return null;

  // 1. If the message was sent by a normal user (not a bot), use that
  if (!message.author.bot) {
    return message.author.id;
  }

  // 2. If the message mentions exactly 1 user, it's probably for them
  if (message.mentions.users.size === 1) {
    return message.mentions.users.first()?.id ?? null;
  }

  // 3. Otherwise, we can't be sure
  return null;
}

export function buildEternityProfileEmbed(currentEternity: number, title: string, loreText: string) {
  const nextMilestone = getNextTitleTarget(currentEternity);

  const embed = new EmbedBuilder()
    .setTitle("🌟 Eternity Profile")
    .setColor("#00acc1")
    .addFields(
      { name: "🏆 Current Title", value: title, inline: false },
      { name: "✨ Lore", value: loreText, inline: false },
      { name: "🧮 Eternity Progress", value: `**${currentEternity.toLocaleString()} Eternity**`, inline: true }
    )
    .setTimestamp();

  if (nextMilestone) {
    const percentProgress = Math.min(100, Math.floor((currentEternity / nextMilestone.threshold) * 100));
    const progressBar = createProgressBar(percentProgress);

    embed.addFields(
      { name: `🎯 Next Title: **${nextMilestone.title}** at **${nextMilestone.threshold} Eternity**`, value: `${progressBar} (${percentProgress}%)`, inline: false }
    );
  } else {
    embed.addFields(
      { name: "🎯 Title Progress", value: "🛡️ You have reached the final Title!", inline: false }
    );
  }

  return embed;
}