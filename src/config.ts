import { EmbedBuilder, Interaction } from "discord.js";
import { Intent, ConsoleColor } from "./handler";

// Message command prefix.
export const prefix: string = "ep ";

// Intents which will be enabled by default.
export const defaultIntents: Intent[] = [Intent.Guilds, Intent.MessageContent, Intent.GuildMessages, Intent.GuildMembers, Intent.GuildPresences];

// Default folder names.
export const eventsFolderName: string = "events";
export const commandsFolderName: string = "commands";
export const componentsFolderName: string = "components";

// Your Discord ID (for owner only commands)
export const ownerId: string = "936693149114449921";

// Layout for the info logging message.
export function getLoggerLogMessage(message: string): string {
    return `${ConsoleColor.Green}[INFO] ${message}${ConsoleColor.Reset}`;
}

// Layout for the warning logging message.
export function getLoggerWarnMessage(message: string): string {
    return `${ConsoleColor.Yellow}[WARNING] ${message}${ConsoleColor.Reset}`;
}

// Layout for the error logging message.
export function getLoggerErrorMessage(message: string): string {
    return `${ConsoleColor.Red}[ERROR] ${message}${ConsoleColor.Reset}`;
}

// Generates an embed when a user lacks the necessary conditions to execute a command.
export function getCommandNotAllowedEmbed(interaction: Interaction): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("You are not authorized to use this command!")
        .setColor("#DA373C")
}

// Generates an embed when a command is on cooldown.
export function getCommandOnCooldownEmbed(timeLeft: number, commandName: string): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("Command on cooldown")
        .setColor("#DA373C")
        .setDescription(`Please wait ${timeLeft} more second(s) before reusing the \`${commandName}\` command.`);
}
