import {
  ChannelType,
  EmbedBuilder,
  Message
} from "discord.js";
import { PrefixCommand } from "../../handler";
const { getisland, isOwner } = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
  name: "slowmodeoff",
  aliases: ["smoff", "Slowmodeoff", "slowoff"],
  allowedGuilds: ['1135995107842195550', '1113339391419625572', '839731097473908767', '871269916085452870'],
  allowedRoles: [
    '1147864509344661644', '1148992217202040942','807811542057222176',
    '1113407924409221120', '1113451646031241316', '845499229429956628',
    '839731097633423389', '1130783135156670504', '871393325389844521'
  ],
  allowedCategories: [
    "1140190313915371530", "1147909067172483162", "1147909156196593787",
    "1203928376205905960", "1232728117936914432", "1192106199404003379",
    "1192108950049529906", "1225165761920630845", "966458661469839440",
    "808109909266006087", "825060923768569907", "1113414355669753907",
    "1115772256052846632", "1113414451912257536", "1115072766878691428",
    "1151855336865665024", "1320055421561471048", "1115357822222348319",
    "839731102281105409", "839731101885923345", "839731101622075415",
    "872692223488184350", "1019301054120210482", "839731101391781906",
    "967657150769942578", "1128607975972548711",'1075867237891723404', // Luminescent Booster
    '1075867596534055094', // luminescent Member Rooms
    '1169317414748569701', // Luminescent Member Rooms II
    '1075868205396017152', // Luminescent Plebs Rooms
  ],

  async execute(message: Message): Promise<void> {
    try {
      if (message.channel.type !== ChannelType.GuildText) return;

      const getOwner = await isOwner(message.author.id);
      const member = await message.guild.members.fetch(message.author.id);
      const isOwnerOfChannel = getOwner?.some((entry: any) => entry.channel === message.channel.id);
      const modRoles: { [guildId: string]: string } = {
        "1135995107842195550": "1148992217202040942",
        "1113339391419625572": "1113407924409221120",
        "839731097473908767": "845499229429956628",
        "871269916085452870": "871393325389844521",
      };
      const roleId = modRoles[message.guild.id];

      if (!isOwnerOfChannel && (!roleId || !member.roles.cache.has(roleId))) {
        await message.reply('❌ You must be an island owner or staff to run this command.');
        return;
      } else {
        console.log("Slowmode Off Ran In:", message.channel.id, "by", message.author.id);
      }

      if (message.channel.rateLimitPerUser) {
        await message.channel.setRateLimitPerUser(0);
        const island = await getisland(message.channel.id);
        const users = [
          island.user, island.cowner1, island.cowner2, island.cowner3,
          island.cowner4, island.cowner5, island.cowner6, island.cowner7
        ];

        for (const userId of users) {
          if (!userId) continue;
          const user = await message.guild.members.fetch(userId).catch(() => null);
          const role = message.guild.roles.cache.get(userId);
          if (user) {
            await message.channel.permissionOverwrites.edit(user, { ManageMessages: false });
          } else if (role) {
            await message.channel.permissionOverwrites.edit(role, { ManageMessages: false });
          }
        }
      }

      const embed = new EmbedBuilder()
        .setTitle("Channel Manager: Slowmode Off")
        .setDescription("Slowmode has been disabled.\n*To re-enable, use `ep slowmode`*")
        .setColor("#097969");

      await message.reply({ embeds: [embed] });
    } catch (err) {
      console.error("❌ Error in slowmodeoff command:", err);
    }
  }
});