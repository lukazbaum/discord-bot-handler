// src/services/externalEmbedResponder.ts

import {
  Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType
} from "discord.js";
import {
  parseEternalEmbed, parseProfileEmbed, parseInventoryEmbed,
  calculateFullInfo, formatPage1, formatPage2
} from "./eUtils";
import { eternalSessionStore } from "./sessionStore";

export async function eternalEmbedResponder(message: Message): Promise<void> {
  const userId = message.author.id;
  const content = message.content.toLowerCase();
  const session = eternalSessionStore.get(userId);

  if (!session || session.channelId !== message.channel.id) return;
  if (session.origin === "command") return; // 🛑 critical fix

  try {
    if (session.step === "awaitingEternal" && message.author.bot && message.embeds.length) {
      session.eternal = parseEternalEmbed(message.embeds[0].data);
      session.step = "awaitingProfile";
      return void message.reply("📘 Now send `rpg p`...");
    }

    if (session.step === "awaitingProfile" && message.author.bot && message.embeds.length) {
      session.profile = parseProfileEmbed(message.embeds[0].data);
      session.step = "awaitingInventory";
      return void message.reply("🎒 Now send `rpg i`...");
    }

    if (session.step === "awaitingInventory" && message.author.bot && message.embeds.length) {
      session.inventory = parseInventoryEmbed(message.embeds[0].data);
      session.step = "awaitingGoal";
      return void message.reply("🎯 What’s your **target Eternality**?");
    }

    if (session.step === "awaitingGoal" && !message.author.bot) {
      const goal = parseInt(content.trim());
      if (isNaN(goal)) return void message.reply("❌ Invalid number. Try `400`");
      session.goal = goal;
      session.step = "awaitingTC";
      return void message.reply("🍪 How many **Time Cookies** do you use per cooldown reset?");
    }

    if (session.step === "awaitingTC" && !message.author.bot) {
      const tc = parseInt(content.trim());
      if (isNaN(tc)) return void message.reply("❌ Invalid number. Try `3`");
      session.tc = tc;
      session.step = "awaitingExpectedTT";
      return void message.reply("🧮 How many **total Time Travels** do you expect after unsealing?");
    }

    if (session.step === "awaitingExpectedTT" && !message.author.bot) {
      const expectedTT = parseInt(content.trim());
      if (isNaN(expectedTT)) return void message.reply("❌ Invalid number. Try `1200`");

      session.expectedTT = expectedTT;

      const result = calculateFullInfo(
        session.eternal,
        { ...session.profile!, timeTravels: expectedTT },
        session.inventory,
        session.goal!,
        session.tc!,
        expectedTT,
      );

      const pages = [formatPage1(result), formatPage2(result)];
      let currentPage = 0;

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId("prev").setLabel("⏮️ Prev").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("next").setLabel("⏭️ Next").setStyle(ButtonStyle.Secondary)
      );

      const reply = await message.reply({ embeds: [pages[currentPage]], components: [row] });

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

      eternalSessionStore.delete(userId);
    }
  } catch (err) {
    console.error("⚠️ Eternal embed responder error:", err);
    eternalSessionStore.delete(userId);
    return void message.reply("⚠️ Something went wrong. Please type `ep eternal` again.");
  }
}