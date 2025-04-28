import { PaginatorButtonType, } from '../types/Paginator';
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, InteractionCallbackResponse, MessageComponentInteraction, MessageFlags, } from 'discord.js';
export class EmbedPaginator {
    settings;
    currentPageIndex;
    maxPageIndex;
    constructor(settings) {
        this.settings = settings;
        this.currentPageIndex = 0;
        this.maxPageIndex = settings.pages.length;
        this.settings.restrictToAuthor = settings.restrictToAuthor ?? true;
    }
    async send(options) {
        const { context, ephemeral, followUp, content } = options;
        if (context instanceof AutocompleteInteraction)
            return;
        const isInteraction = context instanceof CommandInteraction || context instanceof MessageComponentInteraction;
        let messageOptions = {
            content,
            flags: ephemeral ? [MessageFlags.Ephemeral] : [],
            embeds: [this.getPageEmbed()],
            components: this.getPageComponents(),
            withResponse: true,
        };
        if (!messageOptions.content) {
            delete messageOptions.content;
        }
        let sentMessage;
        if (isInteraction) {
            const interaction = context;
            const sendMethod = followUp ? 'followUp' : 'reply';
            sentMessage = (await interaction[sendMethod](messageOptions));
        }
        else {
            const message = context;
            sentMessage = await message.reply({
                content: messageOptions.content,
                embeds: messageOptions.embeds,
                components: messageOptions.components,
            });
        }
        await this.collectButtonInteractions(sentMessage);
    }
    getPageEmbed() {
        const page = this.settings.pages[this.currentPageIndex];
        const embed = page?.embed ?? page;
        if (this.settings.autoPageDisplay) {
            embed.setFooter({ text: `Page ${this.currentPageIndex + 1}/${this.maxPageIndex}` });
        }
        return embed;
    }
    getPageComponents() {
        const page = this.settings.pages[this.currentPageIndex];
        const components = [];
        components.push(this.createButtonRow());
        if (!(page instanceof EmbedBuilder) && page.components) {
            const customComponents = page.components;
            components.push(...customComponents);
        }
        return components;
    }
    createButtonRow() {
        const row = new ActionRowBuilder();
        const defaultButtons = {
            [PaginatorButtonType.First]: { customId: 'paginator:first', style: ButtonStyle.Primary, emoji: '⏮' },
            [PaginatorButtonType.Previous]: { customId: 'paginator:previous', style: ButtonStyle.Primary, emoji: '◀' },
            [PaginatorButtonType.Next]: { customId: 'paginator:next', style: ButtonStyle.Primary, emoji: '▶' },
            [PaginatorButtonType.Last]: { customId: 'paginator:last', style: ButtonStyle.Primary, emoji: '⏭' },
        };
        const isFirstPage = this.currentPageIndex === 0;
        const isLastPage = this.currentPageIndex === this.maxPageIndex - 1;
        Object.entries(defaultButtons).forEach(([type, config]) => {
            const customConfig = this.settings.buttons?.find((btn) => btn.type === +type) || null;
            const button = new ButtonBuilder()
                .setCustomId(config.customId)
                .setStyle(customConfig?.style ?? config.style)
                .setEmoji(customConfig?.emoji ?? config.emoji)
                .setDisabled(!this.settings.loopPages &&
                (((+type === PaginatorButtonType.First || +type === PaginatorButtonType.Previous) && isFirstPage) ||
                    ((+type === PaginatorButtonType.Next || +type === PaginatorButtonType.Last) && isLastPage)));
            if (customConfig?.label) {
                button.setLabel(customConfig.label);
            }
            if (!this.settings.hideFirstLastButtons ||
                (+type !== PaginatorButtonType.First && +type !== PaginatorButtonType.Last)) {
                row.addComponents(button);
            }
        });
        return row;
    }
    async collectButtonInteractions(context) {
        const message = context instanceof InteractionCallbackResponse && context.resource?.message
            ? context.resource.message
            : context;
        const authorId = message.author.id;
        const filter = (interaction) => interaction.isButton() &&
            interaction.message.id === message.id &&
            (!this.settings.restrictToAuthor || interaction.user.id !== authorId);
        const collector = message.createMessageComponentCollector({
            filter,
            time: this.settings.timeout * 1000,
        });
        collector.on('collect', async (interaction) => {
            try {
                switch (interaction.customId) {
                    case 'paginator:first':
                        this.currentPageIndex = 0;
                        break;
                    case 'paginator:previous':
                        this.currentPageIndex = Math.max(0, this.currentPageIndex - 1);
                        break;
                    case 'paginator:next':
                        this.currentPageIndex = Math.min(this.maxPageIndex - 1, this.currentPageIndex + 1);
                        break;
                    case 'paginator:last':
                        this.currentPageIndex = this.maxPageIndex - 1;
                        break;
                    default:
                        return;
                }
                await interaction.deferUpdate();
                await interaction.editReply({
                    embeds: [this.getPageEmbed()],
                    components: this.getPageComponents(),
                });
            }
            catch (error) {
                console.error('Error handling interaction:', error);
            }
        });
        collector.on('end', async () => {
            try {
                if (!this.settings.showButtonsAfterTimeout) {
                    await message.edit({
                        components: [],
                    });
                }
            }
            catch (error) {
                console.error('Error ending collector:', error);
            }
        });
    }
}
