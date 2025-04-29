import { PrefixCommand } from '../../handler';
import { Message, EmbedBuilder, TextChannel, NewsChannel, ThreadChannel } from 'discord.js';
import { paginateEmbedWithSelect } from '../../utils/paginateEmbedWithSelect';
const { getEternalPathChoice } = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
  name: 'eternal-myplan',
  aliases: ['emyplan', 'eternitymyplan', 'eternityplan'],

  async execute(message: Message): Promise<void> {
    const userId = message.author.id;
    const guildId = message.guild?.id;
    const channel = message.channel;

    if (!guildId || !(channel instanceof TextChannel || channel instanceof ThreadChannel || channel instanceof NewsChannel)) {
      await message.reply('❌ This command can only be used inside a server text channel.');
      return;
    }

    const savedPlan = await getEternalPathChoice(userId, guildId);

    if (!savedPlan) {
      await message.reply('❌ No saved Eternity plan found. Use `!eternal-planner` first!');
      return;
    }

    const pages = [];

    const page1 = new EmbedBuilder()
      .setTitle('📈 Eternity Plan Overview')
      .setColor('#0099ff')
      .addFields(
        { name: 'Current Eternity', value: `${savedPlan.current_eternity}`, inline: true },
        { name: 'Target Eternity', value: `${savedPlan.target_eternity}`, inline: true },
        { name: 'TT Goal', value: `${savedPlan.tt_goal}`, inline: true }
      )
      .setFooter({ text: `Saved on: ${savedPlan.date_chosen ? new Date(savedPlan.date_chosen).toLocaleDateString() : 'Unknown'}` });

    const page2 = new EmbedBuilder()
      .setTitle('🔥 Eternity Progress Requirements')
      .setColor('#ff6600')
      .addFields(
        { name: 'Flames Needed', value: savedPlan.flames_needed?.toLocaleString() || '❓', inline: true },
        { name: 'Estimated Dungeons', value: savedPlan.dungeons_needed?.toLocaleString() || '❓', inline: true },
        { name: 'Estimated Time Cookies', value: savedPlan.time_cookies?.toLocaleString() || '❓', inline: true }
      );

    const page3 = new EmbedBuilder()
      .setTitle('🛡️ Gear Readiness & Predictions')
      .setColor('#33cc99')
      .addFields(
        { name: 'Predicted Sword Tier', value: `T${savedPlan.sword_tier ?? '?'}`, inline: true },
        { name: 'Power 40% Ready?', value: savedPlan.power_ready ? '✅ Yes' : '❌ No', inline: true },
        { name: 'Bite 52% Ready?', value: savedPlan.bite_ready ? '✅ Yes' : '❌ No', inline: true },
        { name: 'Potency 20% Ready?', value: savedPlan.potency_ready ? '✅ Yes' : '❌ No', inline: true }
      );

    pages.push(page1, page2, page3);

    await paginateEmbedWithSelect(message, pages, 120000);
  }
});