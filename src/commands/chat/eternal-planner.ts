import { PrefixCommand } from '../../handler';
import { Message, EmbedBuilder, TextChannel, NewsChannel, ThreadChannel } from 'discord.js';
import { paginateEmbedWithSelect } from '../../utils/paginateEmbedWithSelect';
import { calculatePlanner } from '../../services/eternalPlannerHelper';
const { saveEternityPlan } = require('/home/ubuntu/ep_bot/extras/functions');


export default new PrefixCommand({
  name: 'eternal-planner',
  aliases: ['eplanner', 'eternityplanner', 'planeternity'],

  async execute(message: Message): Promise<void> {
    const userId = message.author.id;
    const guildId = message.guild?.id;
    const channel = message.channel;

    if (!guildId || !(channel instanceof TextChannel || channel instanceof ThreadChannel || channel instanceof NewsChannel)) {
      await message.reply('❌ This command can only be used in a server text channel.');
      return;
    }
    const filter = (m: any) => m.author.id === userId;
    const collectorTime = 120000; // 2 minutes timeout

    if (!guildId) {
      await message.reply('❌ This command can only be used in a server.');
      return;
    }

    // Step 1
    await message.reply('🧠 What is your **current Eternity** level? (ex: 400)');
    const currentEternityMsg = await channel.awaitMessages({ filter, max: 1, time: collectorTime });
    const currentEternity = parseInt(currentEternityMsg.first()?.content ?? '0');
    if (isNaN(currentEternity)) {
      await message.reply('❌ Invalid number for current Eternity.');
      return;
    }

    // Step 2
    await message.reply('🎯 What is your **target Eternity** you want to reach? (ex: 1200)');
    const targetEternityMsg = await channel.awaitMessages({ filter, max: 1, time: collectorTime });
    const targetEternity = parseInt(targetEternityMsg.first()?.content ?? '0');
    if (isNaN(targetEternity)) {
      await message.reply('❌ Invalid number for target Eternity.');
      return;
    }

    // Step 3
    await message.reply('📈 How many **Time Travels (TT)** do you expect to earn while sealed? (ex: 500)');
    const ttGoalMsg = await channel.awaitMessages({ filter, max: 1, time: collectorTime });
    const ttGoal = parseInt(ttGoalMsg.first()?.content ?? '0');
    if (isNaN(ttGoal)) {
      await message.reply('❌ Invalid number for TT Goal.');
      return;
    }

    // 🔥 Run calculations
    const plan = calculatePlanner(currentEternity, targetEternity, ttGoal);

    // 📄 Build Embed Pages
    const pages = [];

    const page1 = new EmbedBuilder()
      .setTitle('🔥 Eternity Planner Overview')
      .setColor('#ff9900')
      .addFields(
        { name: 'Current Eternity', value: `${plan.currentEternity}`, inline: true },
        { name: 'Target Eternity', value: `${plan.targetEternity}`, inline: true },
        { name: 'Required Flames', value: `${plan.unsealCost.toLocaleString()}`, inline: true },
        { name: 'Estimated Dungeons', value: `${plan.dungeonsNeeded}`, inline: true },
        { name: 'Estimated Time Cookies', value: `${plan.estTimeCookies}`, inline: true }
      );

    const page2 = new EmbedBuilder()
      .setTitle('📈 Bonus TT Prediction')
      .setColor('#6699ff')
      .addFields(
        { name: 'Time Travels Gained (sealed)', value: `${plan.ttGoal}`, inline: true },
        { name: 'Predicted Bonus TTs at Unseal', value: `${plan.bonusTT}`, inline: true }
      );

    const page3 = new EmbedBuilder()
      .setTitle('🛡️ Sword Power & BITE Readiness')
      .setColor('#66cc99')
      .addFields(
        { name: 'Recommended Sword', value: `${plan.powerStats.recommended.name}`, inline: true },
        { name: 'Sword ATK Power', value: `${plan.powerStats.recommended.attack.toLocaleString()}`, inline: true },
        { name: 'Power 40% Ready?', value: plan.powerStats.recommended.attack >= plan.powerStats.atkPowerNeeded ? '✅ Yes' : '❌ No', inline: true },
        { name: 'Bite 52% Ready?', value: plan.powerStats.recommended.attack >= plan.powerStats.atkBitePowerNeeded ? '✅ Yes' : '❌ No', inline: true }
      );

    const page4 = new EmbedBuilder()
      .setTitle('📊 Potency Prediction')
      .setColor('#9966ff')
      .addFields(
        { name: 'Potency Estimation', value: `${plan.powerStats.recommended.attack >= plan.powerStats.atkPowerNeeded ? '✔️ Good Potency' : '⚠️ Needs More Enchants'}` }
      );

    pages.push(page1, page2, page3, page4);

    // 📖 Paginate Pages
    await paginateEmbedWithSelect(message, pages, 120000);

    // 💾 Ask if user wants to save their plan
    await message.reply('💾 Would you like to **save this plan** to your profile? (yes/no)');

    const saveReply = await channel.awaitMessages({ filter, max: 1, time: collectorTime });
    const saveContent = saveReply.first()?.content?.toLowerCase();

    if (saveContent && saveContent.startsWith('y')) {
      await saveEternityPlan({
        userId,
        guildId,
        currentEternity: plan.currentEternity,
        targetEternity: plan.targetEternity,
        ttGoal: plan.ttGoal,
        flamesNeeded: plan.unsealCost,
        dungeonsNeeded: plan.dungeonsNeeded,
        timeCookies: plan.estTimeCookies,
        bonusTT: plan.bonusTT,
        swordTier: parseInt(plan.powerStats.recommended.name.replace(/[^0-9]/g, '')) || 0,
        swordLevel: 0, // No swordLevel info yet
        powerReady: plan.powerStats.recommended.attack >= plan.powerStats.atkPowerNeeded,
        biteReady: plan.powerStats.recommended.attack >= plan.powerStats.atkBitePowerNeeded,
        potencyReady: true
      });
      await message.reply('✅ Plan successfully saved to database!');
    } else {
      await message.reply('❎ No problem! Plan was not saved.');
    }
  }
});