import { EmbedBuilder, Message, MessageFlags } from 'discord.js';
export function getLogChannelPresetEmbed(context, commandName, commandType) {
    const authorId = context instanceof Message ? context.author.id : context.user.id;
    const authorIconURL = context instanceof Message ? context.author.displayAvatarURL() : context.user.displayAvatarURL();
    const messageURL = context.guild && context.channel
        ? `https://discord.com/channels/${context.guild.id}/${context.channel.id}/${context.id}`
        : undefined;
    const logEmbed = new EmbedBuilder()
        .setTitle(`${commandType} triggered`)
        .setColor('Blurple')
        .setDescription(`**${commandType}**: \`${commandName}\`\n**User**: <@${authorId}>\n**Channel**: <#${context.channel?.id}>`)
        .setThumbnail(authorIconURL)
        .setTimestamp();
    const isEphemeralInteraction = !(context instanceof Message) &&
        'flags' in context &&
        typeof context.flags === 'number' &&
        (context.flags & MessageFlags.Ephemeral) === MessageFlags.Ephemeral;
    if (messageURL && !isEphemeralInteraction) {
        logEmbed.setURL(messageURL);
    }
    return logEmbed;
}
