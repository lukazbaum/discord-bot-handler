import {
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

import {
  parseEternalEmbed,
  parseProfileEmbed,
  parseInventoryEmbed,
  calculateFullInfo,
  formatPagePower,
  formatPage1,
  formatPage2,
} from "./eUtils";

import { eternalSessionStore } from "./sessionStore";
import { getEternalUnsealHistory } from "/home/ubuntu/ep_bot/extras/functions";

export async function eternalEmbedResponder(message: Message): Promise<void> {
  const userId = message.author.id;
  const content = message.content.toLowerCase();
  const session = eternalSessionStore.get(userId);

  if (!session || session.channelId !== message.channel.id) return;
  if (session.origin === "command") return;

  try {
    if (session.step === "awaitingEternal" && message.author.bot && message.embeds.length) {
      const parsed = parseEternalEmbed(message.embeds[0].data);
      if ("_error" in parsed) {
        await message.reply(`${parsed._error}\nPlease run \`ep et reset\` to start again.`);
        return;
      }
      session.eternal = parsed;

      if (parsed.eternalProgress < 100) {
        await message.reply("⚠️ Warning: Detected Eternity **less than 100**.\nIs your `rpg p e` embed updated?\nPlease re-run `rpg p e` if needed!");
      }

      const footerText = message.embeds[0].footer?.text || "";

      if (footerText.toLowerCase().includes("unsealed for")) {
        session.step = "awaitingDaysSealed";
        await message.reply("⏳ You are currently **Unsealed**!\nHow many **days until you expect to Unseal**?\n_(Example: 7)_");
        return;
      }

      const history = await getEternalUnsealHistory(userId);
      if (history.length) {
        const lastUnsealDate = new Date(history[0].timestamp);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastUnsealDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        session.daysSealed = diffDays;
        session.step = "awaitingProfile";
        await message.reply(`📆 Detected **${diffDays}** days since last unseal.\n📘 Now send \`rpg p\`...`);
      } else {
        session.step = "awaitingDaysSealed";
        await message.reply("📆 No history found.\nHow many **days until you expect to Unseal**?\n_(Example: 7)_");
      }
      return;
    }

    if (session.step === "awaitingDaysSealed" && !message.author.bot) {
      const days = parseInt(content.trim());
      if (isNaN(days) || days <= 0) {
        await message.reply("❌ Invalid number. Try `7`");
        return;
      }
      session.daysSealed = days;
      session.step = "awaitingProfile";
      await message.reply("📘 Now send `rpg p`...");
      return;
    }

    if (session.step === "awaitingProfile" && message.author.bot && message.embeds.length) {
      session.profile = parseProfileEmbed(message.embeds[0].data);
      session.step = "awaitingInventory";
      await message.reply("🎒 Now send `rpg i`...");
      return;
    }

    if (session.step === "awaitingInventory" && message.author.bot && message.embeds.length) {
      session.inventory = parseInventoryEmbed(message.embeds[0].data);
      session.step = "awaitingGoal";
      await message.reply("🎯 What’s your **target Eternality**?");
      return;
    }

    if (session.step === "awaitingGoal" && !message.author.bot) {
      const goal = parseInt(content.trim());
      if (isNaN(goal)) {
        await message.reply("❌ Invalid number. Try `400`");
        return;
      }

      if (goal <= session.eternal.eternalProgress) {
        await message.reply(`🎯 You are already Eternality **${session.eternal.eternalProgress}**.\nPick a higher number or run \`ep et reset\`.`);
        eternalSessionStore.delete(userId);
        return;
      }

      session.goal = goal;
      session.step = "awaitingTC";
      await message.reply("🍪 How many **Time Cookies** do you use per cooldown reset?");
      return;
    }

    if (session.step === "awaitingTC" && !message.author.bot) {
      const tc = parseInt(content.trim());
      if (isNaN(tc)) {
        await message.reply("❌ Invalid number. Try `3`");
        return;
      }
      session.tc = tc;
      session.step = "awaitingExpectedTT";
      await message.reply("🧮 How many **total Time Travels** you expect after unsealing?");
      return;
    }

    if (session.step === "awaitingExpectedTT" && !message.author.bot) {
      const expectedTT = parseInt(content.trim());
      if (isNaN(expectedTT)) {
        await message.reply("❌ Invalid number. Try `1200`");
        return;
      }

      session.expectedTT = expectedTT;

      const result = calculateFullInfo(
        session.eternal,
        { ...session.profile!, timeTravels: expectedTT },
        session.inventory,
        session.goal!,
        session.tc!,
        expectedTT,
        session.daysSealed ?? 7
      );

      if ("_error" in result) {
        await message.reply(`${result._error}\nPlease run \`ep et reset\`.`);
        eternalSessionStore.delete(userId);
        return;
      }

      const pages = [formatPagePower(result), formatPage1(result), formatPage2(result)];
      let currentPage = 0;

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId("prev").setLabel("⏮️ Prev").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("next").setLabel("⏭️ Next").setStyle(ButtonStyle.Secondary)
      );

      const dropdown = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("select")
          .setPlaceholder("📚 Pick a page...")
          .addOptions(
            new StringSelectMenuOptionBuilder().setLabel("⚡ Power Prediction").setValue("0"),
            new StringSelectMenuOptionBuilder().setLabel("📈 Eternity Progress").setValue("1"),
            new StringSelectMenuOptionBuilder().setLabel("🎒 Inventory & Unseal").setValue("2")
          )
      );

      const reply = await message.reply({ embeds: [pages[currentPage]], components: [row, dropdown] });

      const componentCollector = reply.createMessageComponentCollector({
        time: 600_000
      });

      componentCollector.on("collect", async (i) => {
        if (i.user.id !== userId) {
          return void i.reply({ content: "⛔ Not your session.", ephemeral: true });
        }

        if (i.isButton()) {
          currentPage = i.customId === "next"
            ? (currentPage + 1) % pages.length
            : (currentPage - 1 + pages.length) % pages.length;
          await i.update({ embeds: [pages[currentPage]], components: [row, dropdown] });
        }

        if (i.isStringSelectMenu()) {
          const selected = parseInt(i.values[0]);
          currentPage = selected;
          await i.update({ embeds: [pages[currentPage]], components: [row, dropdown] });
        }
      });

      componentCollector.on("end", () => {
        reply.edit({ components: [] }).catch(() => null);
      });

      eternalSessionStore.delete(userId);
    }
  } catch (err) {
    console.error("⚠️ Eternal embed responder error:", err);
    eternalSessionStore.delete(userId);
    await message.reply("⚠️ Something went wrong. Please type `ep et reset` to restart.");
  }
}