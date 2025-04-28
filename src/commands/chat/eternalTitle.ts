import {
  Message,
  GuildTextBasedChannel,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

import { PrefixCommand } from "../../handler";
import { parseEternalEmbed, getCurrentEternity } from "../../services/eUtils";
import { getUnlockedTitles, setDisplayTitle } from "../../services/eternityUtils";
import { eternalSessionStore as sessionStore } from "../../services/sessionStore";

export default new PrefixCommand({
  name: "title",
  aliases: ["eternitytitle", "etitle"],
  allowedGuilds: ["1135995107842195550"],

  async execute(message: Message) {
    const userId = message.author.id;
    const channelId = message.channel.id;

    const currentEternity = await getCurrentEternity(userId);

    if (currentEternity === null) {
      sessionStore.set(userId, {
        origin: "command",
        step: "awaitingEternal",
        channelId: channelId,
      });

      await message.reply("📜 No Eternity found.\n➡️ Please run `rpg p e` and let me read it!");

      const collector = (message.channel as GuildTextBasedChannel).createMessageCollector({
        time: 180_000,
        filter: (msg) => {
          const session = sessionStore.get(userId);
          return session && msg.channel.id === session.channelId && (msg.author.id === userId || msg.author.bot);
        }
      });

      collector.on("collect", async (msg) => {
        const session = sessionStore.get(userId);
        if (!session || session.step !== "awaitingEternal") return;

        if (!msg.author.bot || !msg.embeds.length) return;

        const parsed = parseEternalEmbed(msg.embeds[0].data);

        if ("_error" in parsed) {
          await msg.reply(`${parsed._error}\nPlease try \`rpg p e\` again.`);
          return;
        }

        const eternity = parsed.eternalProgress;
        await showTitlePicker(message, userId, eternity);

        sessionStore.delete(userId);
        collector.stop();
      });

      return;
    }

    // If already have Eternity, continue
    await showTitlePicker(message, userId, currentEternity);
  }
});

async function showTitlePicker(message: Message, userId: string, currentEternity: number) {
  const unlockedTitles = getUnlockedTitles(currentEternity);

  if (!unlockedTitles.length) {
    await message.reply("📭 You have not unlocked any RPG Titles yet. Keep pushing higher Eternity!");
    return;
  }

  const options = unlockedTitles.map((title, i) => ({
    label: title,
    value: i.toString(),
  }));

  const dropdown = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("selectTitle")
      .setPlaceholder("🏆 Select your RPG Title...")
      .addOptions(
        options.map(opt =>
          new StringSelectMenuOptionBuilder()
            .setLabel(opt.label)
            .setValue(opt.value)
        )
      )
  );

  const reply = await message.reply({
    content: "🛡️ **Choose your RPG Title!**",
    components: [dropdown]
  });

  const collector = reply.createMessageComponentCollector({
    time: 120_000,
    filter: (i) => i.user.id === userId
  });

  collector.on("collect", async (i) => {
    if (!i.isStringSelectMenu()) return;

    const choiceIndex = parseInt(i.values[0]);
    const chosenTitle = unlockedTitles[choiceIndex];

    await setDisplayTitle(userId, chosenTitle);

    await i.update({
      content: `🏆 You are now proudly wearing the title: **${chosenTitle}**!`,
      components: []
    });

    collector.stop();
  });

  collector.on("end", () => {
    reply.edit({ components: [] }).catch(() => null);
  });
}