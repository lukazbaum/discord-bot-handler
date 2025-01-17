import type { Features } from './Features';
import type { ClientOptions } from 'discord.js';

export interface ExtendedClientOptions extends ClientOptions {
  features: Features[];
  disabledFeatures?: Features[];
  uploadCommands: boolean;
  //plugins?: Coming Soon
}
