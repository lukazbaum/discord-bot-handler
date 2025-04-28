export class BaseCommand {
    userCooldown;
    guildCooldown;
    globalCooldown;
    allowedUsers;
    blockedUsers;
    optionalAllowedUsers;
    allowedChannels;
    blockedChannels;
    optionalAllowedChannels;
    allowedCategories;
    blockedCategories;
    optionalAllowedCategories;
    allowedGuilds;
    blockedGuilds;
    optionalAllowedGuilds;
    allowedRoles;
    blockedRoles;
    optionalAllowedRoles;
    restrictedToOwner;
    restrictedToNSFW;
    isDisabled;
    logUsage;
    constructor(args = {}) {
        Object.assign(this, args);
    }
}
