import { Intent } from "./Intent";

/**
 * @see https://discord.com/developers/docs/topics/gateway#list-of-intents List of all Intents
 */
export const EventIntentMapping: Record<string, Array<Intent>> = {
    guildCreate: [Intent.Guilds],
    guildUpdate: [Intent.Guilds],
    guildDelete: [Intent.Guilds],
    guildRoleCreate: [Intent.Guilds],
    guildRoleUpdate: [Intent.Guilds],
    guildRoleDelete: [Intent.Guilds],
    channelCreate: [Intent.Guilds],
    channelUpdate: [Intent.Guilds],
    channelDelete: [Intent.Guilds],
    channelPinsUpdate: [Intent.Guilds],
    threadCreate: [Intent.Guilds],
    threadUpdate: [Intent.Guilds],
    threadDelete: [Intent.Guilds],
    threadListSync: [Intent.Guilds],
    threadMemberUpdate: [Intent.Guilds],
    threadMembersUpdate: [Intent.Guilds, Intent.GuildMembers],
    stageInstanceCreate: [Intent.Guilds],
    stageInstanceUpdate: [Intent.Guilds],
    stageInstanceDelete: [Intent.Guilds],
    guildMemberAdd: [Intent.GuildMembers],
    guildMemberUpdate: [Intent.GuildMembers],
    guildMemberRemove: [Intent.GuildMembers],
    guildAuditLogEntryCreate: [Intent.GuildModeration],
    guildBanAdd: [Intent.GuildModeration],
    guildBanRemove: [Intent.GuildModeration],
    guildEmojisUpdate: [Intent.GuildEmojisAndStickers],
    guildStickersUpdate: [Intent.GuildEmojisAndStickers],
    guildIntegrationsUpdate: [Intent.GuildIntegrations],
    integrationCreate: [Intent.GuildIntegrations],
    integrationUpdate: [Intent.GuildIntegrations],
    integrationDelete: [Intent.GuildIntegrations],
    webhooksUpdate: [Intent.GuildWebhooks],
    inviteCreate: [Intent.GuildInvites],
    inviteDelete: [Intent.GuildInvites],
    voiceStateUpdate: [Intent.GuildVoiceStates],
    presenceUpdate: [Intent.GuildPresences],
    messageCreate: [Intent.GuildMessages],
    messageUpdate: [Intent.GuildMessages],
    messageDelete: [Intent.GuildMessages],
    messageDeleteBulk: [Intent.GuildMessages],
    messageReactionAdd: [Intent.GuildMessageReactions],
    messageReactionRemove: [Intent.GuildMessageReactions],
    messageReactionRemoveAll: [Intent.GuildMessageReactions],
    messageReactionRemoveEmoji: [Intent.GuildMessageReactions],
    typingStart: [Intent.DirectMessageTyping],
    guildScheduledEventCreate: [Intent.GuildScheduledEvents],
    guildScheduledEventUpdate: [Intent.GuildScheduledEvents],
    guildScheduledEventDelete: [Intent.GuildScheduledEvents],
    guildScheduledEventUserAdd: [Intent.GuildScheduledEvents],
    guildScheduledEventUserRemove: [Intent.GuildScheduledEvents],
    autoModerationRuleCreate: [Intent.AutoModerationConfiguration],
    autoModerationRuleUpdate: [Intent.AutoModerationConfiguration],
    autoModerationRuleDelete: [Intent.AutoModerationConfiguration],
    autoModerationActionExecution: [Intent.AutoModerationExecution]
}