import { PrefixCommand } from '../../handler';
import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import { buildEternalProfilePages } from '../../services/eternalProfilePages';
import { loadEternalProfile } from '../../services/eternalProfile';
import { calculateFullInfo, formatPage1, formatPage2, formatPagePower } from '../../services/eUtils';
import { getEternityPlan, saveEternityPlan } from '../../../../ep_bot/extras/functions.js';
import { paginateEmbedWithSelect } from '../../utils/paginateEmbedWithSelect';

export default new PrefixCommand({
  name: 'eternal',
  aliases: ['eternity', 'eternalcalc'],

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

      await paginateEmbedWithSelect(message, [page3, page1, page2], 120_000);
      return;
    }

    await message.reply('❓ Unknown subcommand. Try `ep eternal profile`, `ep eternal predict -tt <goal> -d <days>`, or `ep eternal setplan -tt <goal> -d <days>`');
  }
});