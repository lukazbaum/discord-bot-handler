// src/commands/chat/eternalCalc.ts

import {
  Message, EmbedBuilder, GuildTextBasedChannel,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType
} from "discord.js";
import { PrefixCommand } from "../../handler";
import {
  parseEternalEmbed, parseProfileEmbed, parseInventoryEmbed,
  calculateFullInfo, formatPage1, formatPage2
} from "../../services/eUtils";
import { eternalSessionStore as sessionStore } from "../../services/sessionStore";
import { clearEternalUnsealData } from "/home/ubuntu/ep_bot/extras/functions";
const { getEternalUnsealHistory } = require("/home/ubuntu/ep_bot/extras/functions");

export default new PrefixCommand({
  name: "eternal",
  aliases: ["eprofile", "et"],
  allowedGuilds: ["1135995107842195550"],

  async execute(message: Message): Promise<void> {
    const userId = message.author.id;
    const guildId = message.guild?.id ?? "global";

    if (message.content.includes("help")) {
      const helpEmbed = new EmbedBuilder()
        .setTitle("🧬 Eternal Calculator Help")
        .setColor("#00bcd4")
        .addFields(
          { name: "🧪 Start", value: "`ep eternal` — full calculator" },
          { name: "🔁 Reset", value: "`ep eternal reset`" },
          { name: "🧼 Clear", value: "`ep eternal clear`" },
          { name: "📜 History", value: "`ep eternal history`" }
        );
      return void message.reply({ embeds: [helpEmbed] });
    }

    if (message.content.includes("reset")) {
      sessionStore.set(userId, {
        origin: "command",
        step: "awaitingEternal",
        channelId: message.channel.id
      });
      return void message.reply("♻️ Session reset. Please type `rpg p e` again.");
    }

    if (message.content.includes("clear")) {
      sessionStore.delete(userId);
      await clearEternalUnsealData(userId, guildId);
      return void message.reply("🧼 Session + DB cleared.");
    }

    if (message.content.includes("history")) {
      const history = await getEternalUnsealHistory(userId);
      if (!history.length) return void message.reply("📭 No unseals found.");
      const formatted = history.map((h: any, i: number) =>
        `${i + 1}. <t:${Math.floor(new Date(h.timestamp).getTime() / 1000)}:F>`).join("\n");
      const embed = new EmbedBuilder()
        .setTitle("📜 Eternal Unseal History")
        .setDescription(formatted)
        .setColor("Yellow");
      return void message.reply({ embeds: [embed] });
    }

    sessionStore.set(userId, {
      origin: "command",
      step: "awaitingEternal",
      channelId: message.channel.id
    });

    await message.reply("📜 Type `rpg p e`, then `rpg p`, then `rpg i`…");

    const channel = message.channel;
    if (!("send" in channel)) return;

    const collector = (channel as GuildTextBasedChannel).createMessageCollector({
      time: 300_000,
      filter: (msg) => {
        const session = sessionStore.get(userId);
        return session && msg.channel.id === session.channelId && (msg.author.id === userId || msg.author.bot);
      }
    });

    collector.on("collect", async (msg) => {
      const session = sessionStore.get(userId);
      if (!session) return;

      try {
        if (msg.author.bot && session.step === "awaitingEternal" && msg.embeds.length) {
          session.eternal = parseEternalEmbed(msg.embeds[0].data);
          session.step = "awaitingProfile";
          return void msg.reply("📘 Now send `rpg p`...");
        }

        if (msg.author.bot && session.step === "awaitingProfile" && msg.embeds.length) {
          session.profile = parseProfileEmbed(msg.embeds[0].data);
          session.step = "awaitingInventory";
          return void msg.reply("🎒 Now send `rpg i`...");
        }

        if (msg.author.bot && session.step === "awaitingInventory" && msg.embeds.length) {
          session.inventory = parseInventoryEmbed(msg.embeds[0].data);
          session.step = "awaitingGoal";
          return void msg.reply("🎯 What’s your **target Eternality**?");
        }

        if (!msg.author.bot && session.step === "awaitingGoal") {
          const goal = parseInt(msg.content.trim());
          if (isNaN(goal)) return void msg.reply("❌ Invalid number. Try `400`");
          session.goal = goal;
          session.step = "awaitingTC";
          return void msg.reply("🍪 How many **Time Cookies** do you use per cooldown reset?");
        }

        if (!msg.author.bot && session.step === "awaitingTC") {
          const tc = parseInt(msg.content.trim());
          if (isNaN(tc)) return void msg.reply("❌ Invalid number. Try `3`");
          session.tc = tc;
          session.step = "awaitingExpectedTT";
          return void msg.reply("🧮 How many **total Time Travels will you have at the moment of unsealing?**");
        }

        if (!msg.author.bot && session.step === "awaitingExpectedTT") {
          const expectedTT = parseInt(msg.content.trim());
          if (isNaN(expectedTT)) return void msg.reply("❌ Invalid number. Try `1200`");
          session.expectedTT = expectedTT;

          const result = calculateFullInfo(
            session.eternal,
            { ...session.profile!, timeTravels: expectedTT },
            session.inventory,
            session.goal!,
            session.tc!,
            expectedTT
          );

          const pages = [formatPage1(result), formatPage2(result)];
          let currentPage = 0;

          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId("prev").setLabel("⏮️ Prev").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("next").setLabel("⏭️ Next").setStyle(ButtonStyle.Secondary)
          );

          const reply = await msg.reply({ embeds: [pages[currentPage]], components: [row] });

          const buttonCollector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60_000
          });

          buttonCollector.on("collect", async (i) => {
            if (i.user.id !== userId) return void i.reply({ content: "⛔ Not your session.", ephemeral: true });
            currentPage = i.customId === "next"
              ? (currentPage + 1) % pages.length
              : (currentPage - 1 + pages.length) % pages.length;
            await i.update({ embeds: [pages[currentPage]], components: [row] });
          });

          buttonCollector.on("end", () => {
            reply.edit({ components: [] }).catch(() => null);
          });

          sessionStore.delete(userId);
          collector.stop();
        }
      } catch (err) {
        console.error("⚠️ Eternal Calc Error:", err);
        sessionStore.delete(userId);
        collector.stop();
        await msg.reply("⚠️ Something went wrong. Please start again.");
      }
    });
  }
});