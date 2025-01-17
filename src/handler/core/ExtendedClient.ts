import config from '../../config';
import { Features } from '../types/Features';
import { LogManager } from '../utils/LogManager';
import { Gray, Green } from '../types/TerminalColor';
import { EventManager } from '../events/EventManager';
import type { RegisterType } from '../types/RegisterType';
import { CommandManager } from '../commands/CommandManager';
import { ComponentManager } from '../components/ComponentManager';
import { AutomaticIntents, EventIntentMapping } from '../types/Intent';
import type { ExtendedClientOptions } from '../types/ExtendedClientOptions';
import { Client, type GatewayIntentBits, IntentsBitField } from 'discord.js';
import { type ComponentCollections, emptyComponentCollections } from '../types/ComponentCollections';
import {
  type CommandCollections,
  type CommandCooldownCollections,
  emptyCommandCollections,
  emptyCommandCooldownCollections,
} from '../types/CommandCollections';

export class ExtendedClient extends Client {
  events: string[] = [];
  commands: CommandCollections = emptyCommandCollections;
  commandCooldowns: CommandCooldownCollections = emptyCommandCooldownCollections;
  components: ComponentCollections = emptyComponentCollections;
  private readonly features: Features[];
  private readonly disabledFeatures?: Features[];
  private readonly uploadCommands: boolean;
  private readonly startupTime: number = Date.now();

  constructor(options: ExtendedClientOptions) {
    super(options);
    this.features = options.features;
    this.disabledFeatures = options.disabledFeatures;
    this.uploadCommands = options.uploadCommands;
  }

  async login(token?: string): Promise<string> {
    if (!token) {
      LogManager.logError(
        `Bot token is undefined! ${Gray('Please provide a valid token in the environment variables.')}`,
      );
      await this.shutdown();
    }

    try {
      await this.initializeFeatures();
      const result: string = await super.login(token);
      LogManager.logDefault(
        `\n  ${Green(this.user?.tag ?? 'Unknown User')}  ${Gray('ready in')} ${Date.now() - this.startupTime}ms\n`,
      );
      return result;
    } catch (err: unknown) {
      LogManager.logError('Failed to connect to the bot', err);
      await this.shutdown();
      return '';
    }
  }

  async reloadEvents(): Promise<void> {
    await EventManager.reloadEvents(this);
  }

  async reloadCommands(): Promise<void> {
    if (
      this.isEnabledFeature(Features.SlashCommands) ||
      this.isEnabledFeature(Features.ContextMenus) ||
      this.isEnabledFeature(Features.PrefixCommands)
    )
      await CommandManager.reloadCommands(this);
  }

  async reloadComponents(): Promise<void> {
    if (
      this.isEnabledFeature(Features.Buttons) ||
      this.isEnabledFeature(Features.SelectMenus) ||
      this.isEnabledFeature(Features.Modals)
    )
      await ComponentManager.reloadComponents(this);
  }

  async deleteCommand(registerType: RegisterType, commandId: string): Promise<void> {
    await CommandManager.deleteCommands(registerType, [commandId]);
  }

  async deleteCommands(registerType: RegisterType, commandIds: string[]): Promise<void> {
    await CommandManager.deleteCommands(registerType, commandIds);
  }

  private async initializeFeatures(): Promise<void> {
    await EventManager.registerEvents(this);
    if (this.options.intents.bitfield === AutomaticIntents) this.assignIntents();
    if (
      this.isEnabledFeature(Features.SlashCommands) ||
      this.isEnabledFeature(Features.ContextMenus) ||
      this.isEnabledFeature(Features.PrefixCommands)
    ) {
      await CommandManager.registerCommands(this);
      if (this.uploadCommands) await CommandManager.deployCommands(this);
    }
    if (
      this.isEnabledFeature(Features.Buttons) ||
      this.isEnabledFeature(Features.SelectMenus) ||
      this.isEnabledFeature(Features.Modals)
    ) {
      await ComponentManager.registerComponents(this);
    }
  }

  isEnabledFeature(feature: Features): boolean {
    return (
      (this.features.includes(feature) || this.features.includes(Features.All)) &&
      !this.disabledFeatures?.includes(feature)
    );
  }

  private assignIntents(): void {
    const intentBitField: IntentsBitField = new IntentsBitField();

    for (const event of this.events) {
      const intents: GatewayIntentBits[] = EventIntentMapping[event];
      if (intents) {
        intentBitField.add(...intents);
      }
    }

    intentBitField.add(...config.defaultIntents);
    this.options.intents = intentBitField;
  }

  private async shutdown(): Promise<void> {
    try {
      await this.destroy();
    } catch (err) {
      LogManager.logError('Error during shutdown', err);
    } finally {
      process.exit(0);
    }
  }
}
