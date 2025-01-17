import { Collection } from 'discord.js';
import type { PrefixCommand } from '../commands/prefix/PrefixCommand';
import type { ContextMenu } from '../commands/interactions/ContextMenu';
import type { SlashCommand } from '../commands/interactions/SlashCommand';

export interface CommandCollections {
  slash: Collection<string, SlashCommand>;
  context: Collection<string, ContextMenu>;
  prefix: Collection<string, PrefixCommand>;
  prefixAliases: Collection<string, string>;
}

export interface CommandCooldownCollections {
  user: Collection<string, string>;
  guild: Collection<string, string>;
  global: Collection<string, string>;
}

export const emptyCommandCollections: CommandCollections = {
  slash: new Collection<string, SlashCommand>(),
  context: new Collection<string, ContextMenu>(),
  prefix: new Collection<string, PrefixCommand>(),
  prefixAliases: new Collection<string, string>(),
};

export const emptyCommandCooldownCollections: CommandCooldownCollections = {
  user: new Collection<string, string>(),
  guild: new Collection<string, string>(),
  global: new Collection<string, string>(),
};
