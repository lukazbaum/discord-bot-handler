import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  EmbedBuilder,
  Interaction,
  MentionableSelectMenuBuilder,
  Message,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
} from 'discord.js';

export enum PaginatorButtonType {
  First,
  Previous,
  Next,
  Last,
}

export interface PaginatorSettings {
  pages: (EmbedBuilder | PaginatorPage)[];
  timeout: number;
  buttons?: {
    type: PaginatorButtonType;
    label?: string;
    style?: ButtonStyle;
    emoji?: string;
  }[];
  showButtonsAfterTimeout?: boolean;
  hideFirstLastButtons?: boolean;
  loopPages?: boolean;
  autoPageDisplay?: boolean;
  restrictToAuthor?: boolean;
}

export type ActionRowBuilders =
  ActionRowBuilder<ButtonBuilder>
  | ActionRowBuilder<StringSelectMenuBuilder>
  | ActionRowBuilder<UserSelectMenuBuilder>
  | ActionRowBuilder<RoleSelectMenuBuilder>
  | ActionRowBuilder<MentionableSelectMenuBuilder>
  | ActionRowBuilder<ChannelSelectMenuBuilder>;

export interface PaginatorPage {
  embed: EmbedBuilder;
  components?: ActionRowBuilders[];
}

export interface PaginatorSendOptions {
  context: Interaction | Message;
  ephemeral?: boolean;
  followUp?: boolean;
  content?: string;
}
