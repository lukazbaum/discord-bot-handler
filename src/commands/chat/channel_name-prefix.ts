import {
  EmbedBuilder,
  Message,
  ChannelType
} from "discord.js";
import { PrefixCommand } from '../../handler';
const { isOwner } = require('/home/ubuntu/ep_bot/extras/functions');
const emojiRegex = require('emoji-regex');

export default new PrefixCommand({
  name: "name",
  aliases: [],
  allowedGuilds: ['1135995107842195550', '1113339391419625572', '839731097473908767', '871269916085452870'],
  allowedRoles: [
    '1147864509344661644', '1148992217202040942', '807811542057222176',
    '1113407924409221120', '1113451646031241316', '845499229429956628',
    '839731097633423389', "1130783135156670504", '871393325389844521'
  ],
  allowedCategories: [
    '1147909067172483162', '1147909156196593787', '1147909539413368883',
    '1147909373180530708', '1147909282201870406', '1147909200924643349',
    '1140190313915371530', '1203928376205905960', '1232728117936914432',
    '1192106199404003379', '1192108950049529906', '1225165761920630845',
    '966458661469839440', '808109909266006087',
    '1113414355669753907', '1115772256052846632',
    '1115072766878691428', '1151855336865665024', '1320055421561471048',
    '1115357822222348319', '839731102281105409', '839731101885923345',
    '839731101622075415', '872692223488184350', '1019301054120210482',
    '839731101391781906', '967657150769942578', '1128607975972548711',
    '1075867237891723404', '1075867596534055094', '1169317414748569701',
    '1075868205396017152',
    '1113414355669753907',// epic wonderland staff
    '1113414451912257536', // epic wonderland booster
    '1391112199367557280', // epic wonderland booster 1
    '1115072766878691428', // epic wonderland supreme land
    '1151855336865665024', // epic wonderland supreme land 1
    '1320055421561471048', // epic wonderland supreme land 2
    '1391110746477428887', // epic wonderland supreme land 3
    '1391110806661369927', // epic wonderland supreme land 4
    '1391110893101912215', // epic wonderland supreme land 5
    '1115357822222348319', // epic wonderland Epic Host Land
  ],
  userCooldown: 30,

  async execute(message: Message): Promise<void> {
    try {
      if (message.channel.type !== ChannelType.GuildText) return;

      const guildId = message.guild.id;
      const userId = message.author.id;
      const checkStaff = await message.guild.members.fetch(userId);
      const ownerCheck = await isOwner(userId);
      const isOwnerOfChannel = ownerCheck && ownerCheck.some(entry => entry.channel === message.channel.id);

      const staffRoleMap: { [key: string]: string } = {
        "1135995107842195550": "1148992217202040942",
        "1113339391419625572": "1113407924409221120",
        "839731097473908767": "845499229429956628",
        "871269916085452870": "871393325389844521"
      };

      const modRoleId = staffRoleMap[guildId];

      if (!isOwnerOfChannel && !checkStaff.roles.cache.has(modRoleId)) {
        await message.reply("❌ You must be an owner/cowner or have the staff role to rename this channel.");
        return;
      }

      const commandBody = message.content.replace(/^ep name\s+/i, "").trim();
      if (!commandBody) {
        await message.reply("❌ Please provide a name. Example: `ep name 😎 my epic room`");
        return;
      }

      const emojiMatch = emojiRegex().exec(commandBody);
      let emoji = emojiMatch ? emojiMatch[0] : null;
      let nameText = emoji ? commandBody.split(emoji)[1]?.trim() : commandBody;

      if (!nameText || nameText.length < 2) {
        await message.reply("❌ Please specify a valid channel name.");
        return;
      }

      let newName = "";
      if (emoji) {
        if (guildId === "1135995107842195550") newName = `${emoji}・${nameText}`;
        else if (guildId === "1113339391419625572") newName = `${emoji} ⸾⸾ ${nameText} ⸾⸾`;
        else if (guildId === "839731097473908767") newName = `${emoji}・${nameText}`;
        else if (guildId === "871269916085452870") newName = `${emoji}║${nameText}`;
      } else {
        if (guildId === "1135995107842195550") newName = `・${nameText}`;
        else if (guildId === "1113339391419625572") newName = `⸾⸾ ${nameText} ⸾⸾`;
        else if (guildId === "839731097473908767") newName = `||${nameText}`;
        else if (guildId === "871269916085452870") newName = `║${nameText}`;
      }

      if (newName.length > 100) {
        await message.reply("❌ Channel name too long. Must be 100 characters or fewer.");
        return;
      }

      await message.channel.edit({ name: newName });

      const embed = new EmbedBuilder()
        .setTitle("✅ Channel Name Updated")
        .setDescription(`Channel renamed to: **${newName}**\n\n*Changes may take up to 10 minutes to reflect.*`)
        .setColor("#097969");

      await message.reply({ embeds: [embed] });

    } catch (err) {
      console.error("❌ Error in ep name command:", err);
      await message.reply("❌ Something went wrong while renaming the channel.");
    }
  }
});