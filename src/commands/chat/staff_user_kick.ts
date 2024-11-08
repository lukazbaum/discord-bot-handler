import { TextChannel, Message, ChannelType, ChannelManager, Role, GuildChannel, GuildMember, BitField, PermissionsBitField, EmbedBuilder } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { guildBan } = require('/home/ubuntu/ep_bot/extras/functions');


export = {
    name: "kickuser",
    aliases: ["ku", "kick"],
    type: CommandTypes.PrefixCommand,
    // 1113339391419625572 - Epic Wonderland
    // 801822272113082389 - Epic
    // 1135995107842195550 - Epic Park
    guildWhitelist: ['1135995107842195550', '801822272113082389','1113339391419625572'],
    roleWhitelist:["1148992217202040942", // epic park staff
                    "1113407924409221120" // epic staff
    ],
    async execute(message: Message): Promise<void> {
        try{
        let reason;
        let messageContent = message.content.toString().toLowerCase()
        let messageContentSplit = messageContent.split(" ");
        let buildReason;
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

        var banlog = await message.guild.channels.cache.find(channel => channel.id === `1142426394442350693`) as TextChannel;
        await banlog.send({embeds: [embed]})


        } catch (error) {
            console.error(error);
	    if(message.channel.type !== ChannelType.GuildText) return;
            await message.channel.send('Failed to kick the user. Ensure the bot has the correct permissions.');
        }
    }
} as PrefixCommandModule;
