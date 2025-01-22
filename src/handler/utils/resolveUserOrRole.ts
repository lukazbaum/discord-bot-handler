import { Guild, Role, GuildMember } from "discord.js";

/**
 * Resolves a user or role ID to a valid Discord.js Role, GuildMember, or raw ID.
 * Dynamically fetches members if they are not cached.
 * Handles Unknown Member errors gracefully.
 */
export const resolveUserOrRole = async (
  guild: Guild,
  userOrRoleId: string
): Promise<Role | GuildMember | string | null> => {
    const resolvedRole = guild.roles.resolve(userOrRoleId);
    if (resolvedRole) return resolvedRole;

    try {
        return await guild.members.fetch(userOrRoleId);
    } catch (error: any) {
        if (error.code === 10007) {
            console.warn(`User ${userOrRoleId} is not a member of the guild.`);
            return null; // Skip invalid users
        }
        console.error(`Failed to fetch user ${userOrRoleId}:`, error);
        return null; // Log and continue for other errors
    }
};