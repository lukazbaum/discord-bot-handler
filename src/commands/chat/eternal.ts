import { PrefixCommand } from '../../handler';
import { EmbedBuilder,
  Message,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle } from 'discord.js';
import { buildEternalProfilePages } from '../../services/eternalProfilePages';
import { loadEternalProfile } from '../../services/eternalProfile';
import { calculateFullInfo, formatPage1, formatPage2, formatPagePower, formatPage4 } from '../../services/eUtils';
import { getEternityPlan, saveEternityPlan, getEternalPathChoice } from '../../../../ep_bot/extras/functions.js';
import { paginateEmbedWithSelect } from '../../utils/paginateEmbedWithSelect';

export default new PrefixCommand({
  name: 'eternal',
  aliases: ['et', 'eternity', 'eternalcalc'],

  async execute(message: Message): Promise<void> {
    const fullArgs = message.content.trim().split(/\s+/);
    const args = fullArgs.slice(2); // SKIP ["ep", "eternal"]
    const subcommand = args[0];


    const userId = message.author.id;
    const guildId = message.guild!.id;

    if (!subcommand) {
      await message.reply('❓ Usage: `ep eternal profile`, `ep eternal predict -d <days>`, or `ep eternal setplan -tt <tt> -d <days>`');
      return;
    }
    if (subcommand === 'help') {
      const helpEmbed = new EmbedBuilder()
          .setTitle("🧬 Eternal Command Help")
          .setColor("#6a0dad")
          .setDescription("Welcome to the Eternity Manager! Here's a guide to all available commands.")
          .addFields(
              {
                name: "📊 `ep eternal profile`",
                value: "View your Eternity Profile dashboard with dungeon win stats, unseal history, and target plan.",
                inline: false
              },
              {
                name: "🔮 `ep eternal predict`",
                value: "Simulate your next unseal based on Time Travel and seal duration. Estimates Bonus TT, readiness, and gear.",
                inline: false
              },
              {
                name: "🗓️ `ep eternal setplan -tt <goal> -d <days>`",
                value: "Save your Eternity target plan in the database so predictions remember it.",
                inline: false
              },
              {
                name: "📘 `ep eternal myplan`",
                value: "[UNDER DEVELOPMENT] View your saved Eternity plan with bonus projections, flame needs, dungeon estimates, and gear status.",
                inline: false
              },
              {
                name: "🚪 `ep eternal planner` _(Coming Soon)_",
                value: "Full walkthrough to customize your plan including TC usage, gear, and bonus TT efficiency.",
                inline: false
              },
              {
                name: "📦 Auto Detection",
                value: "The bot listens to RPG embeds and updates your profile automatically. Use `rpg p e`, `rpg p`, `rpg i`, and dungeon win messages.",
                inline: false
              },
              {
                name: "💡 Tip",
                value: "After each Eternity unseal, type `rpg p e`, `rpg p`, `rpg i` and do one dungeon win. This updates your profile fully!",
                inline: false
              }
          )
          .setFooter({ text: "Need help? DM JennyB or use ep eternal help anytime." })
          .setTimestamp();

      await message.reply({ embeds: [helpEmbed] });
      return;
    }

    if (subcommand === 'profile') {
      try {
        const pages = await buildEternalProfilePages(userId, guildId);
        await paginateEmbedWithSelect(message, pages, 120_000);
      } catch (err) {
        console.error("❌ Error loading profile pages:", err);
        await message.reply('❌ Could not load your Eternity Profile.');
      }
      return;
    }

    if (subcommand === 'setplan') {
      const ttIndex = args.findIndex(arg => arg === '-tt');
      const dIndex = args.findIndex(arg => arg === '-d');

      const ttGoal = ttIndex !== -1 ? parseInt(args[ttIndex + 1]) : NaN;
      const days = dIndex !== -1 ? parseInt(args[dIndex + 1]) : NaN;

      if (isNaN(ttGoal) || isNaN(days)) {
        await message.reply('❌ Invalid usage. Use: `ep eternal setplan -tt <tt_goal> -d <days>`');
        return;
      }

      const profile = await loadEternalProfile(userId, guildId);
      if (!profile) {
        await message.reply('❌ No Eternity Profile found. Run `rpg p e` and try again.');
        return;
      }

      const plan = {
        userId,
        guildId,
        currentEternity: profile.currentEternity,
        targetEternity: profile.targetEternity || (profile.currentEternity + 200),
        ttGoal,
        flamesNeeded: 0,
        dungeonsNeeded: 0,
        timeCookies: 0,
        bonusTT: 0,
        swordTier: profile.swordTier,
        swordLevel: profile.swordLevel,
        powerReady: null,
        biteReady: null,
        potencyReady: null,
        daysSealed: days
      };

      await saveEternityPlan(plan);
      await message.reply(`✅ Plan saved: TT Goal = ${ttGoal}, Days Sealed = ${days}`);
      return;
    }

    if (subcommand === 'myplan') {
      const [savedPlan, savedPath] = await Promise.all([
        getEternityPlan(userId, guildId),
        getEternalPathChoice(userId, guildId)
      ]);

      if (!savedPlan && !savedPath) {
        await message.reply('❌ No saved Eternity plan found. Use `ep eternal setplan -tt <tt> -d <days>` or `ep eternal planner` first!');
        return;
      }

      const page1 = new EmbedBuilder()
        .setTitle("📘 Your Eternity Plan")
        .setDescription("Your sealed strategy at a glance.")
        .setColor("#00b0f4")
        .addFields(
          { name: "🌟 Current Eternity", value: `${savedPlan?.currentEternity ?? savedPath?.current_eternity ?? '❓'}`, inline: true },
          { name: "🎯 Goal Eternity", value: `${savedPlan?.targetEternity ?? savedPath?.target_eternity ?? '❓'}`, inline: true },
          { name: "📆 Sealed For (Days)", value: `${savedPlan?.daysSealed ?? '❓'}`, inline: true },
          { name: "🕰️ TT Goal", value: `${savedPlan?.ttGoal ?? savedPath?.tt_goal ?? '❓'}`, inline: true },
          { name: "🧠 Strategy", value: savedPath?.chosen_path || "❓", inline: true }
        )
        .setFooter({ text: `Saved on: ${savedPath?.date_chosen ? new Date(savedPath.date_chosen).toLocaleDateString() : 'Unknown'}` });

      const page2 = new EmbedBuilder()
        .setTitle("🔥 Progress Requirements")
        .setColor("#ff8800")
        .addFields(
          { name: "🔓 Flames Needed", value: savedPlan?.flamesNeeded?.toLocaleString() || "❓", inline: true },
          { name: "🏰 Dungeons Needed", value: savedPlan?.dungeonsNeeded?.toLocaleString() || "❓", inline: true },
          { name: "🍪 Time Cookies (Est.)", value: savedPlan?.timeCookies?.toLocaleString() || "❓", inline: true },
          { name: "📈 Bonus TT (Est.)", value: savedPlan?.bonusTT?.toLocaleString() || "❓", inline: true }
        );

      const predictedGear = savedPlan?.swordTier
        ? `T${savedPlan.swordTier}` + (savedPlan.swordLevel ? ` Lv${savedPlan.swordLevel}` : "")
        : "❓";

      const page3 = new EmbedBuilder()
        .setTitle("🛡️ Gear Readiness")
        .setColor("#00cc99")
        .addFields(
          { name: "🗡️ Predicted Gear", value: predictedGear, inline: true },
          { name: "✅ Power 40% Ready", value: savedPlan?.powerReady ? "✅ Yes" : "❌ No", inline: true },
          { name: "💙 Bite 52% Ready", value: savedPlan?.biteReady ? "✅ Yes" : "❌ No", inline: true },
          { name: "🔮 Potency 20% Ready", value: savedPlan?.potencyReady ? "✅ Yes" : "❌ No", inline: true }
        );

      await paginateEmbedWithSelect(message, [page1, page2, page3], 120_000);
      return;
    }

    if (subcommand === 'predict') {
      const ttIndex = args.findIndex(arg => arg === '-tt');
      const dIndex = args.findIndex(arg => arg === '-d');

      const manualTT = ttIndex !== -1 ? parseInt(args[ttIndex + 1]) : undefined;
      const manualDays = dIndex !== -1 ? parseInt(args[dIndex + 1]) : undefined;

      const profile = await loadEternalProfile(userId, guildId);
      if (!profile) {
        await message.reply('❌ No Eternity Profile found. Run `rpg p e` and try again.');
        return;
      }

      const savedPlan = await getEternityPlan(userId, guildId);
      const ttGoal = manualTT ?? savedPlan?.ttGoal;
      const daysUntilUnseal = manualDays ?? savedPlan?.daysSealed;
      const targetEternity = savedPlan?.targetEternity ?? (profile.currentEternity + 200);

      if (!ttGoal || !daysUntilUnseal) {
        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("⏳ Missing Time Travel Goal or Days")
              .setDescription("Set both with `ep eternal setplan -tt <goal> -d <days>` or override with `ep eternal predict -tt <tt> -d <days>`")
              .setColor("#ffaa00")
          ]
        });
        return;
      }

      const lastUnsealTT = profile.lastUnsealTT ?? 0;
      const ttGained = Math.max(1, ttGoal - lastUnsealTT);

      const eternal = {
        eternalProgress: profile.currentEternity,
        lastUnsealTT
      };

      const inventory = {
        eternityFlames: profile.flamesOwned ?? 0
      };

      const result = calculateFullInfo(
        eternal,
        profile,
        inventory,
        targetEternity,
        36,
        ttGained,
        daysUntilUnseal
      );

      const page1 = formatPage1(result);
      const page2 = formatPage2(result);
      const page3 = formatPagePower(result);
      const page4 = formatPage4 (result, profile);

      await paginateEmbedWithSelect(message, [page3, page1, page4, page2], 120_000);
      return;
    }

    await message.reply('❓ Unknown subcommand. Try `ep eternal profile`, `ep eternal predict -tt <goal> -d <days>`, or `ep eternal setplan -tt <goal> -d <days>`');
  }
});