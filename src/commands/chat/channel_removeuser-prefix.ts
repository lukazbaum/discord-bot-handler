import { ChannelType, Message,EmbedBuilder,} from "discord.js";
import { PrefixCommand } from '../../handler';
const {isOwner, removeuser, removecowners, getisland, addedusers} = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
    name: "removeuser",
    aliases: ["Removeuser", "remuser", "rem"],
    // 1113339391419625572 - Epic Wonderland
    // 839731097473908767 - Blackstone
    // 1135995107842195550 - Epic Park
  // 871269916085452870 - Luminescent
  allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767','871269916085452870'],
  allowedRoles: ['1147864509344661644', '1148992217202040942', '1246691890183540777','1246691890183540777',
    '807826290295570432',
    '1073788272452579359',
    '807826290295570432',
    '1262566008405622879',
    '1113407924409221120', // epic wonderland staff
    '1113451646031241316', // epic wonderland users
    '845499229429956628', // Blackstone Staff
    '839731097633423389', // Blackstone Users
    "1130783135156670504", // Luminescent Users
    '871393325389844521', // Luminescent Leiutenint
  ],
  allowedCategories: ['1147909067172483162',
    '1147909156196593787',
    '1147909539413368883',
    '1147909373180530708',
    '1147909282201870406',
    '1147909200924643349',
    '1140190313915371530',
    '1203928376205905960',
    '1232728117936914432',
    '1192106199404003379',
    '1192108950049529906',
    '1225165761920630845',
    '966458661469839440',
    '808109909266006087',
    '825060923768569907',
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

    '839731102813913107', // Blackstone Squires Corner
    '839731102281105409', // Blackstone Knights Hall
    '839731101885923345', // Blackstone wizards tower
    '839731101622075415', // Blackstone Dragon Cave
    '872692223488184350', // Blackstone Nitro Islands
    '839731101391781906', // Blackstone Kingdom Elite
    '967657150769942578', // Blackstone Royal Wing
    '1019301054120210482', // Blackstone Donors
    '967657150769942578', // Blackstone Staff
    '1128607975972548711', // Luminescent Staff
    '1075867237891723404', // Luminescent Booster
    '1075867596534055094', // luminescent Member Rooms
    '1169317414748569701', // Luminescent Member Rooms II
    '1075868205396017152', // Luminescent Plebs Rooms

  ],
  async execute(message: Message): Promise<void> {
    try {
      if (message.channel.type !== ChannelType.GuildText) return;

      // Ensure channel owner or staff
      const getOwner = await isOwner(message.author.id);
      const isChannelOwner = getOwner?.some(o => o.channel === message.channel.id);
      const member = message.guild.members.cache.get(message.author.id);
      const modRoles = {
        '1135995107842195550': '1148992217202040942',
        '1113339391419625572': '1113407924409221120',
        '839731097473908767': '845499229429956628',
        '871269916085452870': '871393325389844521'
      };
      const staffRole = modRoles[message.guild.id];
      if (!isChannelOwner && !(member?.roles.cache.has(staffRole))) {
        await message.reply('You must be the channel owner or staff to run this command.');
        return;
      }

      // Parse target ID or mention without fetching guild member
      const parts = message.content.trim().split(/\s+/);
      const rawTarget = parts[2];
      if (!rawTarget) {
        await message.reply('Please specify a valid user mention or user ID.');
        return;
      }
      let cleanId: string | null = null;
      const mentionMatch = rawTarget.match(/^<@!?(\d+)>$/);
      if (mentionMatch) {
        cleanId = mentionMatch[1];
      } else if (/^\d{17,19}$/.test(rawTarget)) {
        cleanId = rawTarget;
      } else {
        await message.reply('Please specify a valid user mention or user ID.');
        return;
      }

      // Remove from addedusers even if user left server
      const adds = await addedusers(message.channel.id);
      if (adds.some(u => u.user === cleanId)) {
        await removeuser(cleanId, message.channel.id);
      }

      // Remove from cowners
      const channelInfo = await getisland(message.channel.id);
      const cownerKeys = Object.entries(channelInfo)
        .filter(([key, val]) => val === cleanId)
        .map(([key]) => key.replace(/cowner/, ''));
      for (const idx of cownerKeys) {
        await removecowners(message.channel.id, idx);
      }

      // Remove permission overwrite if exists
      try {
        await message.channel.permissionOverwrites.delete(cleanId);
      } catch {}

      const embed = new EmbedBuilder()
        .setTitle('Channel Manager: Remove User')
        .setDescription(`<@!${cleanId}> has been removed\n*To add the user back, use ep adduser*`)
        .setColor('#097969');

      await message.reply({ embeds: [embed] });

    } catch (err) {
      console.error('Removeuser command error:', err);
    }
  }
});