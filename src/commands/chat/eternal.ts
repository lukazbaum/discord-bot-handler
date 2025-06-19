import { PrefixCommand } from '../../handler';
import { EmbedBuilder,
  Message,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle } from 'discord.js';
import { buildEternalProfilePages } from '../../services/eternalProfilePages';
import { loadEternalProfile } from '../../services/eternityProfile';
import { calcBonusTT, calculateFullInfo, formatPage1, formatPage2, formatPagePower, formatPage4, buildLeaderboardEmbed} from '../../services/eUtils';
import { getEternityPlan, saveEternityPlan, updateEternityPlan, getEternalPathChoice, getGlobalLeaderboard, getLeaderboard, getUserRank} from '../../../../ep_bot/extras/functions.js';
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
      await message.reply('❓ Usage: `ep eternal profile`, `ep eternal predict -d <days>`, or `ep eternal setplan -tt <tt> -d <days> -t <targetE>`');
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
              name: "🗓️ `ep eternal setplan -tt <goal> -d <days> -e <target>`",
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
          const { pages, labels } = await buildEternalProfilePages(userId, guildId, message.client, undefined);
          await paginateEmbedWithSelect(message, pages, 120_000, labels);
      } catch (err) {
        console.error("❌ Error loading profile pages:", err);
        await message.reply('❌ Could not load your Eternity Profile.');
      }
      return;
    }

    if (subcommand === 'setplan') {
      const ttIndex = args.findIndex(arg => arg === '-tt');
      const dIndex = args.findIndex(arg => arg === '-d');
      const targetIndex = args.findIndex(arg => ['-e', '-target'].includes(arg));
      const targetEternity = targetIndex !== -1 ? parseInt(args[targetIndex + 1]) : undefined;

      if (targetIndex !== -1 && isNaN(targetEternity)) {
        await message.reply("❌ Invalid target Eternity provided after `-e`. Please use a valid number.");
        return;
      }

      const ttGoal = ttIndex !== -1 ? parseInt(args[ttIndex + 1]) : NaN;
      const days = dIndex !== -1 ? parseInt(args[dIndex + 1]) : NaN;

      if (isNaN(ttGoal) || isNaN(days)) {
        await message.reply('❌ Invalid usage. Use: `ep eternal setplan -tt <tt_goal> -d <days> -target <Eternity>`\n\nYou can also omit `-tt` to default to your last unseal TT.');
        return;
      }

      // Load the profile using userId only (now global)
      const profile = await loadEternalProfile(userId);
      if (!profile) {
        await message.reply('❌ No Eternity Profile found. Run `rpg p e` and try again.');
        return;
      }

      if (!profile.swordTier || !profile.armorTier) {
        await message.reply("❗ I need your sword and armor tier to evaluate flame discounts. Please run `rpg p e` and try again.");
        return;
      }

      // Check if plan already exists (global, by userId)
      const existingPlan = await getEternityPlan(userId);

      // Only set guildId if there is not one already
      const planGuildId = existingPlan?.guildId || message.guild?.id;

      const plan = {
        userId,
        guildId: planGuildId,
        currentEternity: profile.currentEternity,
        targetEternity: targetEternity ?? profile.targetEternity ?? (profile.currentEternity + 200),
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

      const ttGained = plan.ttGoal - (profile.lastUnsealTT ?? 0);
      const bonusEstimate = calcBonusTT(
        profile.currentEternity,
        Math.max(1, ttGained),
        plan.daysSealed
      );

      if (existingPlan) {
        await updateEternityPlan(userId, guildId, {
          current_eternity: profile.currentEternity,
          tt_goal: plan.ttGoal,
          target_eternity: plan.targetEternity,
          days_sealed: plan.daysSealed,
          bonus_tt_estimate: bonusEstimate
          // Don't pass guildId; keep original
        });
        await message.reply(`✅ Plan updated: TT Goal = ${ttGoal} ${ttIndex === -1 ? "(from last unseal)" : ""}, Days Sealed = ${days}, Target Eternity ≈ ${targetEternity}`);
      } else {
        await saveEternityPlan({
          ...plan,
          bonus_tt_estimate: bonusEstimate
        });
        await message.reply(`✅ Plan saved: TT Goal = ${ttGoal} ${ttIndex === -1 ? "(from last unseal)" : ""}, Days Sealed = ${days}, Target Eternity ≈ ${targetEternity}`);
      }
      return;
    }

    if (subcommand === 'myplan') {
      const [savedPlan, savedPath] = await Promise.all([
        getEternityPlan(userId),
        getEternalPathChoice(userId)
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
          { name: "🌟 Current Eternity", value: savedPlan?.currentEternity?.toLocaleString() ?? '❓', inline: true },
          { name: "🎯 Goal Eternity", value: savedPlan?.targetEternity?.toLocaleString() ?? '❓', inline: true },
          { name: "📆 Sealed For (Days)", value: savedPlan?.daysSealed != null ? savedPlan.daysSealed.toString() : '❓', inline: true },
          { name: "🕰️ TT Goal", value: savedPlan?.ttGoal != null ? savedPlan.ttGoal.toLocaleString() : '❓', inline: true },
          { name: "🧠 Strategy", value: savedPath?.chosen_path || "❓", inline: true }
        )
        .setFooter({ text: `Saved on: ${savedPath?.date_chosen ? new Date(savedPath.date_chosen).toLocaleDateString() : 'Unknown'}` });

      const page2 = new EmbedBuilder()
        .setTitle("🔥 Progress Requirements")
        .setColor("#ff8800")
        .addFields(
          { name: "🔓 Flames Needed", value: savedPlan?.flamesNeeded?.toLocaleString() || "❓", inline: true },
          { name: "🏰 Dungeon Wins Needed", value: savedPlan?.dungeonsNeeded != null ? savedPlan.dungeonsNeeded.toLocaleString() : "❓", inline: true },
          { name: "🍪 Time Cookies (Est.)", value: savedPlan?.timeCookies != null ? savedPlan.timeCookies.toLocaleString() : "❓", inline: true },
          { name: "📈 Bonus TT (Est.)", value: savedPlan?.bonusTT != null ? savedPlan.bonusTT.toLocaleString() : "❓", inline: true }
        );

      const predictedGear = savedPlan?.swordTier
        ? `T${savedPlan.swordTier}` + (savedPlan.swordLevel ? ` Lv${savedPlan.swordLevel}` : "")
        : "❓";

      const page3 = new EmbedBuilder()
        .setTitle("🛡️ Gear Readiness")
        .setColor("#00cc99")
        .addFields(
          { name: "🗡️ Predicted Gear", value: predictedGear, inline: true },
          { name: "✅ Power 40% Ready", value: savedPlan?.powerReady === 1 ? "✅ Yes" : "❌ No", inline: true },
          { name: "💙 Bite 52% Ready", value: savedPlan?.biteReady === 1 ? "✅ Yes" : "❌ No", inline: true },
          { name: "🔮 Potency 20% Ready", value: savedPlan?.potencyReady === 1 ? "✅ Yes" : "❌ No", inline: true }
        );

      await paginateEmbedWithSelect(
        message,
        [page1, page2, page3],
        120_000,
        [
          '📈 Your Eternity Plan',
          '🔥 Progress Requirements',
          '🛡️ Gear Readiness',
        ]
      );
      return;
    }
    function parseStatAlias(raw) {
      const normalized = (raw || '').toLowerCase();
      if (["flames", "flame", "f"].includes(normalized)) return "flames";
      if (["wins", "win", "dungeons", "dungeon", "w"].includes(normalized)) return "wins";
      if (["bonus", "tt", "bonus_tt", "bonustt", "b"].includes(normalized)) return "bonus";
      return "flames";
    }

    if (subcommand === 'leaderboard' || subcommand === 'lb') {
      // ep eternal leaderboard [flames|wins|bonus|alias] [topN] [global|server]
      let stat = parseStatAlias(args[1] || 'flames');
      let topN = Math.max(3, Math.min(Number(args[2]) || 10, 20));
      let scopeArg = args[3]?.toLowerCase();
      let showBoth = !scopeArg || (scopeArg !== "global" && scopeArg !== "server");
      let guildName = message.guild?.name ?? "this server";
      let guildId = message.guild?.id ?? "";

      // force one only if specified
      let scopes: ("global" | "server")[] = showBoth ? ["global", "server"] : [scopeArg as "global" | "server"];

      try {
        const results = await Promise.all(scopes.map(scope => {
          if (scope === "global") {
            return getLeaderboard({ stat, scope: "global", topN });
          } else {
            return getLeaderboard({ stat, scope: "server", guildId, topN });
          }
        }));

        // Build both embeds
        const userRanks = await Promise.all(scopes.map(scope => {
          if (scope === "global") {
            return getUserRank({ userId, stat, scope: "global" });
          } else {
            return getUserRank({ userId, stat, scope: "server", guildId });
          }
        }));

        let embeds = [];
        for (let i = 0; i < scopes.length; ++i) {
          const scope = scopes[i];
          const rows = results[i];
          const yourRank = userRanks[i];
          embeds.push(buildLeaderboardEmbed(
            rows, stat, scope, scope === "server" ? guildName : null, yourRank, userId
          ));
        }
        await message.reply({ embeds });
      } catch (err) {
        console.error("❌ Error in leaderboard:", err);
        await message.reply('❌ Could not load leaderboard.');
      }
      return;
    }

    if (subcommand === 'predict') {
      const ttIndex = args.findIndex(arg => arg === '-tt');
      const dIndex = args.findIndex(arg => arg === '-d');

      const targetIndex = args.findIndex(arg => ['-e', '-target'].includes(arg));
      const manualTarget = targetIndex !== -1 ? parseInt(args[targetIndex + 1]) : undefined;

      const manualTT = ttIndex !== -1 ? parseInt(args[ttIndex + 1]) : undefined;
      const manualDays = dIndex !== -1 ? parseInt(args[dIndex + 1]) : undefined;

      const profile = await loadEternalProfile(userId);
      if (!profile) {
        await message.reply('❌ No Eternity Profile found. Run `rpg p e` and try again.');
        return;
      }

      if (!profile.swordTier || !profile.armorTier) {
        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("🛡️ Missing Gear Info for Discount")
              .setDescription([
                "I need your `T6`+ **sword and armor tier** to evaluate flame discounts.",
                "",
                "🔁 Please run `rpg p e` in your server.",
                "📦 This will update your Eternity Profile automatically."
              ].join("\n"))
              .setColor("#ffaa00")
          ]
        });
        return;
      }

      const savedPlan = await getEternityPlan(userId);
      const ttGoal = ttIndex !== -1
        ? parseInt(args[ttIndex + 1])
        : savedPlan?.ttGoal ?? profile.lastUnsealTT ?? NaN;
      const daysUntilUnseal = manualDays ?? savedPlan?.daysSealed;
      const targetEternity = manualTarget ?? savedPlan?.targetEternity ?? (profile.currentEternity + 200);

      if (!ttGoal || !daysUntilUnseal || typeof profile.currentEternity !== 'number') {
        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("⚠️ Missing Eternity Data")
              .setDescription("Unable to calculate prediction. Make sure you:\n• Set TT goal and days via `ep eternal setplan`\n• Ran `rpg p e` to update your gear and eternity.")
              .setColor("#ffaa00")
          ]
        });
        return;
      }

      const lastUnsealTT = profile.lastUnsealTT ?? 0;
      const ttGained = Math.max(1, ttGoal - lastUnsealTT);

      const eternal = {
        eternalProgress: profile.currentEternity,
        lastUnsealTT,
        swordTier: profile.swordTier,
        armorTier: profile.armorTier
      };

      const inventory = {
        eternityFlames: profile.flamesOwned ?? 0
      };

      const result = {
        ...calculateFullInfo(
          eternal,
          profile,
          inventory,
          targetEternity,
          36,
          ttGained,
          daysUntilUnseal
        ),
        ttGoal,
        lastUnsealTT,
        ttGained,
        daysSealed: daysUntilUnseal,
        currentEternality: profile.currentEternity,
        targetEternity
      };

      if (result._error) {
        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("⚠️ Incomplete Prediction")
              .setDescription(result._error)
              .setColor("#ff3333")
          ]
        });
        return;
      }

      const page1 = formatPage1(result);
      const page2 = formatPage2(result);
      const page3 = formatPagePower(result);
      const page4 = formatPage4(result, profile);

      await paginateEmbedWithSelect(
        message,
        [page3, page1, page4, page2],
        120_000,
        [
          '⚡ Gear Success Prediction',
          '📈 Bonus TT Strategy',
          '🚪 Exit Strategy',
          '🎒 Inventory Readiness'
        ]
      );
      return;
    }

    await message.reply('❌ Invalid usage. Use: `ep eternal setplan -tt <tt_goal> -d <days> -e <targetEternity>`');  }
});