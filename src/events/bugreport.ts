import { EventModule } from "../handler";
import { handleComponents } from "../handler/util/handleComponents";
import { handleInteractionCommands } from "../handler/util/handleInteractionCommands";
const { Client, Interaction, Message, EmbedBuilder,  ModalSubmitInteraction,  ModalSubmitFields, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

export = {
    name: Events.InteractionCreate,
    async execute(interaction: typeof ModalSubmitInteraction, client: typeof Client): Promise<void> {

        if (!interaction.guild) return;
        if (!interaction.isModalSubmit()) return;
	 if (interaction.customId) {
            if (interaction.customId.includes("bugSolved - ")) {
                var stringId = interaction.customId;
                stringId = stringId.replace("bugSolved - ", "");

                var member = await client.users.fetch(stringId);
                await member.send(`🌍 This message was initialized by the developers indicating that the bug you reported has been solved.`).catch(err => {});
                await interaction.reply({ content: `🌍 I have notified the member that their report is now solved.`, ephemeral: true });
                await interaction.message.delete().catch(err => {});
            }
        }

        if (interaction.customId === 'bugreport') {
            const command = interaction.fields.getTextInputValue('type');
            const description = interaction.fields.getTextInputValue('description');

            const id = interaction.user.id;
            const member = interaction.member;
            const server = interaction.guild;

            const channel = await interaction.channels.cache.get('1214003627472191548');

            const embed = new EmbedBuilder()
            	.setColor("Blurple")
            	.setTitle(`📬 New Bug Report!`)
            	.addFields({ name: "Reporting Member", value: `\`${member.user.username} (${id})\``})
            	.addFields({ name: "Reporting Guild", value: `\`${server.name} (${server.id})\``})
            	.addFields({ name: `Problematic Feature`, value: `> ${command}`})
            	.addFields({ name: `Report Description`, value: `> ${description}`})
            	.setTimestamp()
            	.setFooter({ text: `Bug Report System`});

            const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(`bugSolved - ${id}`)
                .setStyle(ButtonStyle.Danger)
                .setLabel(`🛠️  Mark as solved`)
            );

            await channel.send({ embeds: [embed], components: [button] }).catch(err => {});
            await interaction.reply({ content: `🌍 Your report has been recorded.  Our developers will look into this issue, and reach out with any further questions.`, ephemeral: true });
        }



    }
} as EventModule;
