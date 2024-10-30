import {
    CommandInteraction,
    EmbedBuilder,
    Interaction,
    Message,
    MessageReaction,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType
} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {updatePlayer, getPlayer } = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "ss",
    aliases: ["splitsteal", "Ss", "split", "steal"],
    type: CommandTypes.PrefixCommand,
    // 1113339391419625572 - Epic Wonderland
    // 801822272113082389 - Epic
    // 1135995107842195550 - Epic Park
    guildWhitelist: ['1135995107842195550', '801822272113082389','1113339391419625572'],
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1246691890183540777',
        '1143236724718317673','807811542057222176',
        '1113407924409221120'], //epic wonderland staff
    async execute(message: Message): Promise<void> {
        try{
            const mentions = message.mentions.users;
            if ( mentions.size !== 2 ) {
                    message.reply('You need to mention exactly two users.');
                    return;
            }
            const [firstPlayer, secondPlayer] = mentions.map((user) => user);

            const row: any = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("split")
                        .setLabel("Split")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("💳"),
                    new ButtonBuilder()
                        .setCustomId("steal")
                        .setLabel("Steal")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("💳"),
                )

            const game= await message.reply({content: "split or steal?", components: [row], });

            const filter = (i)  => i.user.id === firstPlayer.id || i.user.id === secondPlayer.id;

            const collector = game.createMessageComponentCollector({
                componentType: ComponentType.Button,
                filter,
                time: 10_000,
            });

            collector.on('collect', (interaction) => {
                if ( interaction.customId === "split" ) {
                    interaction.reply({content: "selection made", ephemeral: true});
                    return;
                }
                if ( interaction.customId === "steal" ) {
                    interaction.reply({content: "selection made", ephemeral: true});
                    return;
                }
            })


            }catch(err)
            {console.log(err)}
        }
} as PrefixCommandModule;

