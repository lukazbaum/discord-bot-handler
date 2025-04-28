import {
  Message,
  GuildTextBasedChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

import { PrefixCommand } from "../../handler";
import {
  parseEternalEmbed,
  parseProfileEmbed,
  parseInventoryEmbed,
  calculateFullInfo,
  formatPagePower,
  formatPage1,
  formatPage2,
} from "../../services/eUtils";

import { eternalSessionStore as sessionStore } from "../../services/sessionStore";
import { clearEternalUnsealData, getEternalUnsealHistory } from "/home/ubuntu/ep_bot/extras/functions";

export default new PrefixCommand({
  name: "eternal",
  aliases: ["eprofile", "et"],
  allowedGuilds: ["1135995107842195550"],

  async execute(message: Message): Promise<void> {
    const userId = message.author.id;
    const guildId = message.guild?.id ?? "global";
    const content = message.content.toLowerCase();

    if (content.includes("help")) {
      await message.reply({
        content: "🧬 Eternal Calculator Help",
        embeds: [
          {
            title: "🧬 Eternal Calculator Help",
            color: 0x00bcd4,
            fields: [
              { name: "🧪 Start", value: "`ep eternal` — full calculator" },
              { name: "🔁 Reset", value: "`ep eternal reset`" },
              { name: "🧼 Clear", value: "`ep eternal clear`" },
              { name: "📜 History", value: "`ep eternal history`" }
            ]
          }
        ]
      });
      return;
    }

    if (content.includes("reset")) {
      sessionStore.set(userId, {
        origin: "command",
        step: "awaitingEternal",
        channelId: message.channel.id
      });
      await message.reply("♻️ Session reset. Please type `rpg p e` again.");
      return;
    }

    if (content.includes("clear")) {
      sessionStore.delete(userId);
      await clearEternalUnsealData(userId, guildId);
      await message.reply("🧼 Session + Eternal DB cleared.");
      return;
    }

    if (content.includes("history")) {
      const history = await getEternalUnsealHistory(userId);
      if (!history.length) {
        await message.reply("📭 No unseals found.");
        return;
      }
      const formatted = history.map((h: any, i: number) =>
        `${i + 1}. <t:${Math.floor(new Date(h.timestamp).getTime() / 1000)}:F>`
      ).join("\n");

      await message.reply({
        embeds: [
          {
            title: "📜 Eternal Unseal History",
            description: formatted,
            color: 0xffff00
          }
        ]
      });
      return;
    }

    // Begin session
    sessionStore.set(userId, {
      origin: "command",
      step: "awaitingEternal",
      channelId: message.channel.id
    });

    await message.reply("📜 Type `rpg p e`, then `rpg p`, then `rpg i`…");

    const collector = (message.channel as GuildTextBasedChannel).createMessageCollector({
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
        // 🛡️ Filter messages correctly
        const embedSteps = ["awaitingEternal", "awaitingProfile", "awaitingInventory"];
        const inputSteps = ["awaitingDaysSealed", "awaitingGoal", "awaitingTC", "awaitingExpectedTT"];

        if (embedSteps.includes(session.step)) {
          if (!msg.author.bot || !msg.embeds.length) return;
        }

        if (inputSteps.includes(session.step)) {
          if (msg.author.bot) return;
        }

        // 🌟 Real handling begins
        if (msg.author.bot && session.step === "awaitingEternal") {
          const footerText = msg.embeds[0].footer?.text.toLowerCase() || "";

          const parsed = parseEternalEmbed(msg.embeds[0].data);

          if ("_error" in parsed) {
            await msg.reply(`${parsed._error}\nPlease run \`ep et reset\`.`);
            return;
          }

          // ✅ Only after type guard:
          session.eternal = parsed;

          if (parsed.eternalProgress < 100) {
            await msg.reply("⚠️ Warning: Detected Eternity **less than 100**.\nIs your `rpg p e` embed updated?\nPlease re-run `rpg p e` if needed!");
          }

          if (footerText.includes("unsealed for")) {
            try {
              const history = await getEternalUnsealHistory(userId);
              if (history.length) {
                const lastUnsealDate = new Date(history[0].timestamp);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - lastUnsealDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                session.daysSealed = diffDays;
                session.step = "awaitingProfile";
                await msg.reply(`📆 Detected **${diffDays}** days since last unseal.\n📘 Now send \`rpg p\`...`);
              } else {
                session.step = "awaitingDaysSealed";
                await msg.reply("📆 No unseal history found.\n⏳ How many **days until your next unseal**?\n_(Example: 7)_");
              }
            } catch (err) {
              console.error("⚠️ Database error:", err);
              session.step = "awaitingDaysSealed";
              await msg.reply("⚠️ Couldn't load history.\n⏳ How many **days until your next unseal**?\n_(Example: 7)_");
            }
            return;
          }

          if (footerText.includes("sealed")) {
            session.step = "awaitingDaysSealed";
            await msg.reply("📜 Detected **sealed Eternity**.\n⏳ How many **days until your next unseal**?\n_(Example: 7)_");
            return;
          }

          // fallback
          session.step = "awaitingDaysSealed";
          await msg.reply("📜 Couldn't detect Eternity status.\n⏳ How many **days until your next unseal**?\n_(Example: 7)_");
          return;
        }

        if (!msg.author.bot && session.step === "awaitingDaysSealed") {
          const days = parseInt(msg.content.trim());
          if (isNaN(days) || days <= 0) {
            await msg.reply("❌ Invalid number. Try `7`");
            return;
          }
          session.daysSealed = days;
          session.step = "awaitingProfile";
          await msg.reply("📘 Now send `rpg p`...");
          return;
        }

        if (msg.author.bot && session.step === "awaitingProfile") {
          session.profile = parseProfileEmbed(msg.embeds[0].data);
          session.step = "awaitingInventory";
          await msg.reply("🎒 Now send `rpg i`...");
          return;
        }

        if (msg.author.bot && session.step === "awaitingInventory") {
          session.inventory = parseInventoryEmbed(msg.embeds[0].data);
          session.step = "awaitingGoal";
          await msg.reply("🎯 What’s your **target Eternality**?");
          return;
        }

        if (!msg.author.bot && session.step === "awaitingGoal") {
          const goal = parseInt(msg.content.trim());
          if (isNaN(goal)) {
            await msg.reply("❌ Invalid number. Try `400`");
            return;
          }
          if (goal <= session.eternal.eternalProgress) {
            await msg.reply(`🎯 You are already Eternity **${session.eternal.eternalProgress}**.\nRun \`ep et reset\`.`);
            sessionStore.delete(userId);
            collector.stop();
            return;
          }
          session.goal = goal;
          session.step = "awaitingTC";
          await msg.reply("🍪 How many **Time Cookies** do you use per cooldown reset?");
          return;
        }

        if (!msg.author.bot && session.step === "awaitingTC") {
          const tc = parseInt(msg.content.trim());
          if (isNaN(tc)) {
            await msg.reply("❌ Invalid number. Try `3`");
            return;
          }
          session.tc = tc;
          session.step = "awaitingExpectedTT";
          await msg.reply("🧮 How many **total Time Travels** you expect when unsealing?");
          return;
        }

        if (!msg.author.bot && session.step === "awaitingExpectedTT") {
          const expectedTT = parseInt(msg.content.trim());
          if (isNaN(expectedTT)) {
            await msg.reply("❌ Invalid number. Try `1200`");
            return;
          }

          session.expectedTT = expectedTT;

          // ✅ Correct calculateFullInfo usage
          const result = calculateFullInfo(
            session.eternal,
            { ...session.profile!, timeTravels: expectedTT },
            session.inventory,
            session.goal!,
            session.tc!,
            expectedTT,
            session.daysSealed ?? 7
          );

          // ✅ No "_error" checks needed anymore
          const pages = [
            formatPagePower(result),
            formatPage1(result),
            formatPage2(result)
          ];

          let currentPage = 0;

          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId("prev").setLabel("⏮️ Prev").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("next").setLabel("⏭️ Next").setStyle(ButtonStyle.Secondary)
          );

          const dropdown = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("select")
              .setPlaceholder("📚 Select a page...")
              .addOptions(
                new StringSelectMenuOptionBuilder().setLabel("⚡ Power & Gear").setValue("0"),
                new StringSelectMenuOptionBuilder().setLabel("📈 Progress Summary").setValue("1"),
                new StringSelectMenuOptionBuilder().setLabel("🎒 Inventory Readiness").setValue("2")
              )
          );

          const reply = await msg.reply({ embeds: [pages[currentPage]], components: [row, dropdown] });

          const componentCollector = reply.createMessageComponentCollector({ time: 600_000 });

          componentCollector.on("collect", async (i) => {
            if (i.user.id !== userId) {
              await i.reply({ content: "⛔ Not your session.", ephemeral: true });
              return;
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

          sessionStore.delete(userId);
          collector.stop();
        }

      } catch (err) {
        console.error("⚠️ Eternal Calc error:", err);
        sessionStore.delete(userId);
        collector.stop();
        await msg.reply("⚠️ Error! Run `ep et reset` to restart.");
      }
    });
  }
});