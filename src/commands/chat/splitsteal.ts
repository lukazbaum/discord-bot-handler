import {
    CommandInteraction,
    EmbedBuilder,
    Interaction,
    Message,
    MessageReaction,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType, ButtonInteraction,
    ReactionCollector
} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { updatePlayer, getPlayer } = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "ss",
    aliases: ["splitsteal", "Ss", "split", "steal"],
    type: CommandTypes.PrefixCommand,
    guildWhitelist: ['1135995107842195550', '801822272113082389', '1113339391419625572'],
    roleWhitelist: [
                    '1148992217202040942', //Epic Park Staff
                    '807811542057222176', // Epic Staff
                    '1113407924409221120' // Epic  Wonderland
    ],
    async execute(message: Message): Promise<void> {
        try {
            function sleep(ms: number): Promise<void> {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            const startMessage = await message.channel.send('Split or Steal Time! 20 secs to react to this message to participate');
            await startMessage.react('👍');

            const reactionCollector = startMessage.createReactionCollector({
                filter: (reaction, user) => !user.bot && reaction.emoji.name === '👍',
                time: 20000,
            });

            const users: Set<string> = new Set();

            reactionCollector.on('collect', (reaction) => {
                reaction.users.cache.forEach(user => {
                    if (!user.bot) {
                        users.add(user.id);
                    }
                });
            });

            reactionCollector.on('end', async () => {
                const fetchedUsers = await startMessage.reactions.cache.get('👍')?.users.fetch();
                fetchedUsers?.forEach(user => {
                    if (!user.bot) {
                        users.add(user.id);
                    }
                });

                const selectedUsers = Array.from(users);

                console.log("selected users v4", selectedUsers)

                if (selectedUsers.length < 2) {
                    await message.channel.send('Not enough participants. At least 2 participants are required to start the game.');
                    return;
                }

                const winners = selectedUsers.sort(() => 0.5 - Math.random()).slice(0, 2);
                await message.channel.send(`Winners!: <@${winners[0]}> and <@${winners[1]}>`);

                await sleep(1000);

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("split")
                            .setLabel("Split")
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji("💰"),
                        new ButtonBuilder()
                            .setCustomId("steal")
                            .setLabel("Steal")
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji("💸"),
                    );

                const game = await message.reply({ content: "Split or Steal? 20 seconds to choose, one choice only!", components: [row] });

                const filter = (i: ButtonInteraction) => winners.includes(i.user.id);
                const collector = game.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    filter,
                    max: 2,
                    time: 20000,
                });

                const selection: Record<string, string> = {};

                collector.on('collect', async (interaction: ButtonInteraction) => {
                    if (selection[interaction.user.id]) {
                        await interaction.reply({ content: "You have already made your choice!", ephemeral: true });
                        return;
                    }

                    selection[interaction.user.id] = interaction.customId;
                    await interaction.reply({ content: "Selection made! You cannot change it.", ephemeral: true });
                });

                collector.on('end', async () => {
                    const user1 = winners[0];
                    const user2 = winners[1];
                    const choice1 = selection[user1];
                    const choice2 = selection[user2];

                    if (!choice1 || !choice2) {
                        await message.channel.send("Not all participants made a choice in time.");
                        return;
                    }

                    if (choice1 === "split" && choice2 === "split") {
                        await message.channel.send(`[SPLIT] <@${user1}> and <@${user2}> both chose to split! You both win!`);
                    } else if (choice1 === "split" && choice2 === "steal") {
                        await message.channel.send(`[STEAL] <@${user2}> chose to steal and takes all the winnings!`);
                    } else if (choice1 === "steal" && choice2 === "split") {
                        await message.channel.send(`<[STEAL] @${user1}> chose to steal and takes all the winnings!`);
                    } else if (choice1 === "steal" && choice2 === "steal") {
                        await message.channel.send(`[NO WINNER] <@${user1}> and <@${user2}> both chose to steal! No one wins.`);
                    }
                });
            });
        } catch (err) {
            console.error(err);
        }
    }
} as PrefixCommandModule;
