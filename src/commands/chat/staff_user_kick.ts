import { TextChannel, Message, ChannelType, EmbedBuilder } from "discord.js";
import { PrefixCommand } from '../../handler';
const { guildBan } = require('/home/ubuntu/ep_bot/extras/functions');


export default new PrefixCommand({
    name: "kickuser",
    aliases: ["ku", "kick"],
    // 1113339391419625572 - Epic Wonderland
    // 1135995107842195550 - Epic Park
    // 839731097473908767 - Blackstone
    allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767','871269916085452870'],
    allowedRoles:["1148992217202040942", // epic park staff
                    "1113407924409221120", // epic staff
                    '845499229429956628', // Blackstone Staff
        '871393325389844521', // Luminescent Leiutenint

    ],
    async execute(message: Message): Promise<void> {
        try{
            let reason;
            let messageContent = message.content.toString().toLowerCase()
            let messageContentSplit = messageContent.split(" ");
            let buildReason;
            let serverId = message.guild.id
            if(message.channel.type !== ChannelType.GuildText) return;

             const mentionedUser = message.mentions.users.first();

            if (!mentionedUser) {
                await message.channel.send('Please mention a user to kick.');
                return;
            }

            const member = message.guild?.members.cache.get(mentionedUser.id);

            buildReason = messageContentSplit.slice(1)
            reason = String(buildReason).replaceAll(",", " ")

            if (!member) {
                await message.channel.send('User not found in this server.');
                return;
            }

            if (reason.length === 0) {
                reason = "no reason supplied"
            }

            let date = new Date().toLocaleString()
            date = String(date.replace(',', ""))

            await member.kick();
            await message.channel.send(`Kicked ${mentionedUser.tag} successfully.`);

            await guildBan(member, 'kick', reason, message.author.id, String(date))

            let embed = new EmbedBuilder()
                .setTitle("Staff Manager: Kick User")
                .setDescription(`**Action**: Kicked User
                                    **User**: ${member}
                                    **Reason**: ${reason}
                                    **Date:** ${String(date)}
                                    **Set By:** ${message.author.username}`)

            const banChannel: { [key: string]: string } = {
                "1135995107842195550": "1160751610771820554", // epic park
                '1113339391419625572':'1115941478007582740', // epic wonderland staff
                "839731097473908767": "839731097754533897", // blackstone warn logs
            };

            const getBanChannel = Object.entries(banChannel).find(([key, val]) => key === serverId)?.[1];

            const banlog = await message.guild.channels.cache.find(channel => channel.id === getBanChannel) as TextChannel;
                await banlog.send({embeds: [embed]})
                await message.reply({embeds: [embed]})


        } catch (error) {
            console.error(error);
	    if(message.channel.type !== ChannelType.GuildText) return;
            await message.channel.send('Failed to kick the user. Ensure the bot has the correct permissions.');
        }
    }
});
