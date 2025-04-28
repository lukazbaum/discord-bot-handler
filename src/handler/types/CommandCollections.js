import { Collection } from 'discord.js';
export const emptyCommandCollections = {
    slash: new Collection(),
    context: new Collection(),
    prefix: new Collection(),
    prefixAliases: new Collection(),
};
export const emptyCommandCooldownCollections = {
    user: new Collection(),
    guild: new Collection(),
    global: new Collection(),
};
