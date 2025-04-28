import config from '../../config';
import { Features } from '../types/Features';
import { LogManager } from '../utils/LogManager';
import { Gray, Green } from '../types/TerminalColor';
import { EventManager } from '../events/EventManager';
import { CommandManager } from '../commands/CommandManager';
import { ComponentManager } from '../components/ComponentManager';
import { AutomaticIntents, EventIntentMapping } from '../types/Intent';
import { Client, IntentsBitField } from 'discord.js';
import { emptyComponentCollections } from '../types/ComponentCollections';
import { emptyCommandCollections, emptyCommandCooldownCollections, } from '../types/CommandCollections';
export class ExtendedClient extends Client {
    events = [];
    commands = emptyCommandCollections;
    commandCooldowns = emptyCommandCooldownCollections;
    components = emptyComponentCollections;
    features;
    disabledFeatures;
    uploadCommands;
    startupTime = Date.now();
    constructor(options) {
        super(options);
        this.features = options.features;
        this.disabledFeatures = options.disabledFeatures;
        this.uploadCommands = options.uploadCommands;
    }
    async login(token) {
        if (!token) {
            LogManager.logError(`Bot token is undefined! ${Gray('Please provide a valid token in the environment variables.')}`);
            await this.shutdown();
        }
        try {
            await this.initializeFeatures();
            const result = await super.login(token);
            LogManager.logDefault(`\n  ${Green(this.user?.tag ?? 'Unknown User')}  ${Gray('ready in')} ${Date.now() - this.startupTime}ms\n`);
            return result;
        }
        catch (err) {
            LogManager.logError('Failed to connect to the bot', err);
            await this.shutdown();
            return '';
        }
    }
    async reloadEvents() {
        await EventManager.reloadEvents(this);
    }
    async reloadCommands() {
        if (this.isEnabledFeature(Features.SlashCommands) ||
            this.isEnabledFeature(Features.ContextMenus) ||
            this.isEnabledFeature(Features.PrefixCommands))
            await CommandManager.reloadCommands(this);
    }
    async reloadComponents() {
        if (this.isEnabledFeature(Features.Buttons) ||
            this.isEnabledFeature(Features.SelectMenus) ||
            this.isEnabledFeature(Features.Modals))
            await ComponentManager.reloadComponents(this);
    }
    async deleteCommand(registerType, commandId) {
        await CommandManager.deleteCommands(registerType, [commandId]);
    }
    async deleteCommands(registerType, commandIds) {
        await CommandManager.deleteCommands(registerType, commandIds);
    }
    async initializeFeatures() {
        await EventManager.registerEvents(this);
        if (this.options.intents.bitfield === AutomaticIntents)
            this.assignIntents();
        if (this.isEnabledFeature(Features.SlashCommands) ||
            this.isEnabledFeature(Features.ContextMenus) ||
            this.isEnabledFeature(Features.PrefixCommands)) {
            await CommandManager.registerCommands(this);
            if (this.uploadCommands)
                await CommandManager.deployCommands(this);
        }
        if (this.isEnabledFeature(Features.Buttons) ||
            this.isEnabledFeature(Features.SelectMenus) ||
            this.isEnabledFeature(Features.Modals)) {
            await ComponentManager.registerComponents(this);
        }
    }
    isEnabledFeature(feature) {
        return ((this.features.includes(feature) || this.features.includes(Features.All)) &&
            !this.disabledFeatures?.includes(feature));
    }
    assignIntents() {
        const intentBitField = new IntentsBitField();
        for (const event of this.events) {
            const intents = EventIntentMapping[event];
            if (intents) {
                intentBitField.add(...intents);
            }
        }
        intentBitField.add(...config.defaultIntents);
        this.options.intents = intentBitField;
    }
    async shutdown() {
        try {
            await this.destroy();
        }
        catch (err) {
            LogManager.logError('Error during shutdown', err);
        }
        finally {
            process.exit(0);
        }
    }
}
