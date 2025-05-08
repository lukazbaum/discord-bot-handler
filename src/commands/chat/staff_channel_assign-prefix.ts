import {
  Message,
  TextChannel,
  ChannelType,
  EmbedBuilder,
} from "discord.js";
import { PrefixCommand } from "../../handler";
const { checkisland, createisland, enableevents } = require('/home/ubuntu/ep_bot/extras/functions');
const emojiRegex = require("emoji-regex");
const { amarikey } = require("../../../../ep_bot/extras/settings");
const { AmariBot } = require("amaribot.js");
const amariclient = new AmariBot(amarikey);

// Centralized config for all guilds
const guildConfigs = {
  "1135995107842195550": { // Epic Park
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
  "1113339391419625572": { // Epic Wonderland
    ownerRole: "1306823581870854174",
    categories: { default: "1151855336865665024" },
    nameFormat: (emoji, name) => emoji ? `${emoji} ⸾⸾${name}⸾⸾` : `⸾⸾${name}⸾⸾`,
  },
  "839731097473908767": { // Blackstone
    ownerRole: "892026418937077760",
    categories: { default: "839731102813913107" },
    nameFormat: (emoji, name) => emoji ? `${emoji} ||${name}` : `||${name}`,
  },
  "871269916085452870": { // Luminescent
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
  allowedCategories:["1137072690264551604","1203928376205905960","1152037896841351258",
    '1113414355669753907',// epic wonderland play land staff
    '1115772256052846632', /// epic wonderland staff
    "1113414355669753907", // blackstone staff
    "839731098456293420", // blackstone management
    '1128607975972548711', // Luminescent Staff
    '890214306615021648', //luminescent mods only

  ],

  async execute(message: Message): Promise<void> {
    try {
      if (message.channel.type !== ChannelType.GuildText) return;

      const guildId = message.guild.id;
      const config = guildConfigs[guildId];
      if (!config) return;

      const owner = message.mentions.users.first();
      const raw = message.content.split("#")[1];

      if (!owner) {
        await message.reply("❌ Please mention a valid user.");
        return;
      }
      if (!raw) {
        await message.reply("❌ Usage: `assign @user # emoji channelname`");
        return;
      }

      const emojiMatch = [...raw.matchAll(emojiRegex())];
      const emoji = emojiMatch.length > 0 ? emojiMatch[0][0] : null;
      const channelWord = emoji ? raw.split(emoji)[1]?.trimStart() : raw.trim();
      const finalName = config.nameFormat(emoji, channelWord);
      const existingChannel = message.guild.channels.cache.find(c => c.name === finalName);
      const progressBar = await message.channel.send("=>..");

      let channel = existingChannel as TextChannel;
      if (!channel) {
        // Create new channel
        const parent = config.categories.default;
        channel = await message.guild.channels.create({
          name: finalName,
          type: ChannelType.GuildText,
          parent,
        });
      }

      // Amari level logic
      let level = 0;
      if (config.useAmari) {
        try {
          const amari = await amariclient.getUserLevel(guildId, owner.id);
          level = parseInt(`${amari?.level ?? 0}`);
        } catch {
          level = 0;
        }
      }

      // Re-assign category if needed
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
      await channel.permissionOverwrites.edit(owner.id, {
        SendMessages: true,
        ViewChannel: true,
      });
      await progressBar.edit("========>...");

      const dbResult = await createisland(owner.id, channel.id, guildId);
      if (dbResult === "Created!") {
        await enableevents(channel.id);
        const member = message.guild.members.cache.get(owner.id);
        if (member && config.ownerRole) {
          await member.roles.add(config.ownerRole);
        }
      }

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
            .addFields({
              name: "Created At", value: new Date().toLocaleString(), inline: true
            }, {
              name: "Created By", value: `<@${message.author.id}>`, inline: true
            })
        ]
      });

    } catch (err) {
      console.error("❌ Error in assign command:", err);
      await message.reply("❌ Something went wrong. Contact a dev.");
    }
  }
});