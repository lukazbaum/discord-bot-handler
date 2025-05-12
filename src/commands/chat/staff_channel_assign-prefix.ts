import {
  Message,
  TextChannel,
  ChannelType,
  EmbedBuilder,
} from "discord.js";
import { PrefixCommand } from "../../handler";
const { checkisland, createisland, enableevents, getisland, updateOwner } = require('/home/ubuntu/ep_bot/extras/functions');
const emojiRegex = require("emoji-regex");
const { amarikey } = require("../../../../ep_bot/extras/settings");
const { AmariBot } = require("amaribot.js");
const amariclient = new AmariBot(amarikey);

// Centralized config for all guilds
const guildConfigs = {
  "1135995107842195550": {
    ownerRole: "1147864509344661644",
    staffRole: "1148992217202040942",
    boosterRole: "1142141020218347601",
    categories: {
      staff: "1140190313915371530",
      booster: "1147909067172483162",
      default: "1147909200924643349",
      40: "1147909282201870406",
      60: "1147909373180530708",
      80: "1147909539413368883",
      120: "1147909156196593787",
    },
    nameFormat: (emoji, name) => emoji ? `${emoji}・${name}` : `・${name}`,
    useAmari: true,
  },
  "1113339391419625572": {
    ownerRole: "1306823581870854174",
    categories: { default: "1151855336865665024" },
    nameFormat: (emoji, name) => emoji ? `${emoji} ⸾⸾${name}⸾⸾` : `⸾⸾${name}⸾⸾`,
  },
  "839731097473908767": {
    ownerRole: "892026418937077760",
    categories: { default: "839731102813913107" },
    nameFormat: (emoji, name) => emoji ? `${emoji} ||${name}` : `||${name}`,
  },
  "871269916085452870": {
    ownerRole: "1173220944882450564",
    categories: { default: "1075868205396017152" },
    nameFormat: (emoji, name) => emoji ? `${emoji}║${name}` : `║${name}`,
  },
};

export default new PrefixCommand({
  name: "assign",
  aliases: ["ac", "assignch"],
  allowedGuilds: Object.keys(guildConfigs),
  allowedRoles: [
    "1148992217202040942", "807826290295570432", "1073788272452579359",
    "1113407924409221120", "845499229429956628", "871393325389844521"
  ],
  async execute(message: Message): Promise<void> {
    try {
      if (message.channel.type !== ChannelType.GuildText) return;

      const guildId = message.guild.id;
      const config = guildConfigs[guildId];
      if (!config) return;

      const args = message.content.trim().split(/\s+/);

      // Identify the user
      const userToken = args.find(arg =>
        !/^<#\d+>$/.test(arg) && (/^<@!?(\d+)>$/.test(arg) || /^\d{17,20}$/.test(arg))
      );
      const userId = userToken?.match(/\d{17,20}/)?.[0];

      if (!userId) {
        await message.reply("❌ Please mention a valid user or provide a valid ID.");
        return;
      }

      let owner;
      try {
        owner = await message.client.users.fetch(userId);
        console.log(`[ASSIGN] Resolved userId: ${userId}, Owner: ${owner?.tag}`);
      } catch {
        await message.reply("❌ Could not resolve the user from ID.");
        return;
      }

      const userIndex = args.findIndex(arg => arg === userToken);
      const potentialArgs = args.slice(userIndex + 1);

      // Try resolving existing channel by mention
      const mentionedChannel = message.mentions.channels.first();
      let channel: TextChannel | undefined;
      let finalName: string | undefined;

      if (mentionedChannel) {
        channel = mentionedChannel as TextChannel;
        finalName = channel.name;
      } else {
        const rawArgs = potentialArgs.filter(arg => !/^<#\d+>$/.test(arg)).join(" ");
        if (!rawArgs) {
          await message.reply("❌ Usage: assign <userId or mention> emoji channelname");
          return;
        }

        const emojiMatch = [...rawArgs.matchAll(emojiRegex())];
        const emoji = emojiMatch.length > 0 ? emojiMatch[0][0] : null;
        const channelWord = emoji ? rawArgs.split(emoji)[1]?.trimStart() : rawArgs.trim();
        finalName = config.nameFormat(emoji, channelWord);

        if (!channelWord || finalName.length === 0) {
          await message.reply("❌ Please include a valid emoji and channel name.");
          return;
        }

        channel = message.guild.channels.cache.find(c => c.name === finalName) as TextChannel;
      }

      const progressBar = await message.channel.send("=>..");

      if (!channel) {
        channel = await message.guild.channels.create({
          name: finalName,
          type: ChannelType.GuildText,
          parent: config.categories.default,
        });
      }

      // Category logic
      let level = 0;
      if (config.useAmari) {
        try {
          const amari = await amariclient.getUserLevel(guildId, owner.id);
          level = parseInt(`${amari?.level ?? 0}`);
        } catch {
          level = 0;
        }
      }

      if (config.categories) {
        if (config.useAmari && level >= 120 && config.categories[120]) {
          await channel.setParent(config.categories[120]);
        } else if (level >= 80 && config.categories[80]) {
          await channel.setParent(config.categories[80]);
        } else if (level >= 60 && config.categories[60]) {
          await channel.setParent(config.categories[60]);
        } else if (level >= 40 && config.categories[40]) {
          await channel.setParent(config.categories[40]);
        } else {
          await channel.setParent(config.categories.default);
        }
      }

      await channel.lockPermissions();

      const dbInfo = await getisland(channel.id);
      if (dbInfo && dbInfo.user && dbInfo.user !== owner.id) {
        try {
          await channel.permissionOverwrites.delete(dbInfo.user);
        } catch (e) {
          console.warn("⚠️ Couldn't remove old owner's permissions:", e);
        }
        await updateOwner(owner.id, channel.id);
      }

      await channel.permissionOverwrites.edit(owner.id, {
        SendMessages: true,
        ViewChannel: true,
      });

      await enableevents(channel.id);

      const member = message.guild.members.cache.get(owner.id);
      if (member && config.ownerRole) {
        await member.roles.add(config.ownerRole).catch(() => {});
      }

      await progressBar.edit("========>...");

      const embed = new EmbedBuilder()
        .setTitle("✅ Channel Assigned")
        .setDescription(`<@!${owner.id}> assigned to <#${channel.id}>\nCreated by <@!${message.author.id}>`)
        .setColor("#097969");

      await message.reply({ embeds: [embed] });
      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("📌 Channel Info")
            .setDescription(`<@!${owner.id}> now owns this channel.\nUse \`ep help\` for commands.`)
            .addFields(
              { name: "Created At", value: new Date().toLocaleString(), inline: true },
              { name: "Created By", value: `<@${message.author.id}>`, inline: true }
            )
        ]
      });

    } catch (err) {
      console.error("❌ Error in assign command:", err);
      await message.reply("❌ Something went wrong. Contact a dev.");
    }
  }
});