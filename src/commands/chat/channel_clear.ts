import {  Message, ChannelType, EmbedBuilder, TextChannel}  from "discord.js";
import { PrefixCommand } from '../../handler';
const { isOwner} = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
    name: "clear",
    aliases: ["Clear", "delete", "Delete"],
    // 1113339391419625572 - Epic Wonderland
    // 1135995107842195550 - Epic Park
    // 839731097473908767 - Blackstone
    allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767','871269916085452870'],
    allowedRoles: ['1147864509344661644', '1148992217202040942','1147864509344661644','807811542057222176',
              '1113407924409221120', // epic wonderland staff
	        		'1113451646031241316', // epic wonderland users
              '845499229429956628', // Blackstone Staff
              '839731097633423389', // Blackstone Users
             '871393325389844521' // Luminescent Leiutenint

    ],
    allowedCategories: ['1147909067172483162',
	    		'1142846259321913486',
                        '1147909156196593787',
                        '1147909539413368883',
                        '1147909373180530708',
                        '1147909282201870406',
                        '1147909200924643349',
    		                '1137072690264551604',
                        '1140190313915371530',
                        '1203928376205905960',
                        '1232728117936914432',
                        '1192106199404003379',
                        '1192108950049529906',
                        '1225165761920630845',
                        '966458661469839440',
                        '808109909266006087',
                        '825060923768569907',
      '1113414355669753907',// epic wonderland play land staff
      '1115772256052846632', /// epic wonderland staff
      '1113414451912257536', // epic wonderland booster
      '1115072766878691428', // epic wonderland supreme land
      '1151855336865665024', // epic wonderland supreme land 1
      '1320055421561471048', // epic wonderland supreme land 2
      '1115357822222348319', // epic wonderland Epic Host Land
      '839731102813913107', // Blackstone Squires Corner
      '839731102281105409', // Blackstone Knights Hall
      '839731101885923345', // Blackstone wizards tower
      '839731101622075415', // Blackstone Dragon Cave
      '872692223488184350', // Blackstone Nitro Islands
      '1019301054120210482', // Blackstone Donors
      '967657150769942578', // Blackstone Staff
      '1128607975972548711' // Luminescent Staff

    ],
  async execute(message: Message): Promise<void> {
    try {
      if (message.channel.type !== ChannelType.GuildText) return;

      let getOwner = await isOwner(message.author.id);
      let checkStaff = message.guild?.members.cache.get(message.author.id);
      let channel = message.channel.id;
      let serverId = message.guild?.id;

      let checkOwner = getOwner && getOwner.some((authorized) => authorized.channel === channel);

      const modRoleList: { [key: string]: string } = {
        "1135995107842195550": "1148992217202040942", // epic park staff
        "1113339391419625572": "1113407924409221120", // epic wonderland staff
        "839731097473908767": "845499229429956628", // blackstone staff
        "871269916085452870": "871393325389844521", // Luminescent Staff
      };

      const roleId = modRoleList[serverId || ""];

      if (!checkOwner) {
        if (!checkStaff?.roles.cache.has(roleId)) {
          await message.reply('You must be an owner/cowner of this channel to run this command.');
          return;
        } else {
          console.log("Clear Ran In:", message.channel.id, "by", message.author.id);
        }
      }

      let args = message.content.split(" "); // Extract command arguments
      if (args.length < 2) {
        await message.reply('Please supply a number between 1 and 100.');
        return;
      }

      let numberToDelete = parseInt(args[2]); // Convert to number

      if (isNaN(numberToDelete) || numberToDelete < 1 || numberToDelete > 100) {
        await message.reply('Please supply a valid number between 1 and 100.');
        return;
      }

      const textChannel = message.channel as TextChannel; // Ensure channel type is correct
      await textChannel.bulkDelete(numberToDelete, true) // Delete messages
        .then(() => {
          let embed = new EmbedBuilder()
            .setTitle("Channel Manager: Delete Messages")
            .setDescription(`${numberToDelete} messages have been deleted.`)
            .setColor(0x3498db);
          textChannel.send({ embeds: [embed] });
        })
        .catch(err => console.error("Error deleting messages:", err));

    } catch (err) {
      console.error("Command execution error:", err);
    }
  }
});