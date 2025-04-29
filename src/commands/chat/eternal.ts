import { PrefixCommand } from '../../handler';
import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import { loadEternalProfile } from '../../services/eternalProfile';
import { calculateUnsealCost, estimateBonusTT, averageFlamesPerDungeon, estimateTotalFlamesToTarget } from '../../services/eternalCalculator';
import { buildEternalProfilePages } from '../../services/eternalProfilePages';
import { paginateEmbedWithSelect } from '../../utils/paginateEmbedWithSelect';
import { calculateFullInfo, formatPagePower, formatPage1, formatPage2 } from '../../services/eUtils'

export default new PrefixCommand({
  name: 'eternal',
  aliases: ['eternity', 'eternalcalc'],

  async execute(message: Message): Promise<void> {
    const fullArgs = message.content.trim().split(/\s+/);
    const args = fullArgs.slice(2); // SKIP ["ep", "eternal"]
    const subcommand = args[0];

    if (!subcommand) {
      await message.reply('❓ Usage: `ep eternal profile`, `ep eternal predict`, or `ep eternal plan <target>`');
      return;
    }

    const userId = message.author.id;
    const guildId = message.guild!.id;
    if (subcommand === 'profile') {
      try {
        const pages = await buildEternalProfilePages(userId, guildId);
        await paginateEmbedWithSelect(message, pages, 120_000); // 2 minute timeout
      } catch (err) {
        console.error("❌ Error loading profile pages:", err);
        await message.reply('❌ Could not load your Eternity Profile.');
      }
      return;
    }

    if (subcommand === 'predict') {
      const profile = await loadEternalProfile(userId, guildId);
      if (!profile) {
        await message.reply('❌ No Eternity Profile found. Run `rpg p e` and try again.');
        return;
      }

      const currentEternity = profile.currentEternity;
      const flamesOwned = profile.flamesOwned || 0;
      const ttGoal = (profile.pathChoice as any)?.ttGoal || 0;
      const targetEternity = (profile.pathChoice as any)?.targetEternity || (currentEternity + 200);

      const eternal = {
        eternalProgress: currentEternity,
        lastUnsealTT: profile.lastUnsealTT ?? 0
      };

      const inventory = {
        eternityFlames: flamesOwned
      };

      const tcPerDungeon = 3;
      const expectedTTGain = ttGoal;
      const daysSealed = profile.daysSealed ?? 7;

      const result = calculateFullInfo(
          eternal,
          profile,
          inventory,
          targetEternity,
          tcPerDungeon,
          expectedTTGain,
          daysSealed
      );

      const page1 = formatPage1(result);
      const page2 = formatPage2(result);
      const page3 = formatPagePower(result);

      await paginateEmbedWithSelect(message, [page1, page2, page3], 120_000);
      return;
    }

    if (subcommand === 'plan') {
      const profile = await loadEternalProfile(userId, guildId);
      if (!profile) {
        await message.reply('❌ No Eternity Profile found. Cannot plan.');
        return;
      }

      const currentEternity = profile.currentEternity;
      const targetEternity = parseInt(args[1]);
      if (isNaN(targetEternity) || targetEternity <= currentEternity) {
        await message.reply('❌ You must provide a valid target Eternity greater than your current.');
        return;
      }

      const totalFlamesNeeded = estimateTotalFlamesToTarget(currentEternity, targetEternity);
      const averageFlames = averageFlamesPerDungeon(currentEternity);
      const estimatedDungeons = Math.ceil(totalFlamesNeeded / averageFlames);

      const embed = new EmbedBuilder()
        .setTitle(`🛡️ Eternity Push Plan for ${message.author.username}`)
        .setColor('#0099ff')
        .addFields(
          { name: 'Current Eternality', value: `${currentEternity}`, inline: true },
          { name: 'Target Eternality', value: `${targetEternity}`, inline: true },
          { name: '🔥 Total Flames Needed', value: `${totalFlamesNeeded.toLocaleString()} Flames`, inline: false },
          { name: '🏰 Estimated Dungeon Wins Needed', value: `${estimatedDungeons}`, inline: false }
        )
        .setFooter({ text: 'Plan your eternity climb wisely!' })
        .setTimestamp();

      if (message.channel && message.channel.isTextBased() && message.channel instanceof TextChannel) {
        await message.channel.send({ embeds: [embed] });
      }
      return;
    }

    await message.reply('❓ Unknown subcommand. Try `ep eternal profile`, `ep eternal predict`, or `ep eternal plan <target>`.');
  }
});