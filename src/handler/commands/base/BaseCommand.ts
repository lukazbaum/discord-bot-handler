export abstract class BaseCommand {
  userCooldown?: number;
  guildCooldown?: number;
  globalCooldown?: number;
  allowedUsers?: string[];
  blockedUsers?: string[];
  optionalAllowedUsers?: string[];
  allowedChannels?: string[];
  blockedChannels?: string[];
  optionalAllowedChannels?: string[];
  allowedCategories?: string[];
  blockedCategories?: string[];
  optionalAllowedCategories?: string[];
  allowedGuilds?: string[];
  blockedGuilds?: string[];
  optionalAllowedGuilds?: string[];
  allowedRoles?: string[];
  blockedRoles?: string[];
  optionalAllowedRoles?: string[];
  restrictedToOwner?: boolean;
  restrictedToNSFW?: boolean;
  isDisabled?: boolean;
  logUsage?: boolean;

  protected constructor(args: Partial<BaseCommand> = {}) {
    Object.assign(this, args);
  }
}
