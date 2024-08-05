import { ModalSubmitInteraction, ModalActionRowComponentBuilder, Events, CommandInteraction, PermissionFlagsBits,  ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { ComponentModule, ComponentTypes, RegisterTypes, SlashCommandModule } from "../../handler";

export = {
    id: "bugreport",
    type: ComponentTypes.Modal,
    register: RegisterTypes.Guild,
    optionalRoleWhitelist: ['1147864509344661644', '1148992217202040942','1246691890183540777'],
    async execute(interaction): Promise<void> {
        try{

        const modal = new ModalBuilder()
        	.setTitle(`Parkman Bug Reporting`)
        	.setCustomId('bugreport')

        const command = new TextInputBuilder()
        	.setCustomId('type')
        	.setRequired(true)
        	.setPlaceholder('Please only state the problematic feature')
        	.setLabel('What feature has a bug or is being abused?')
        	.setStyle(TextInputStyle.Short);

        const description = new TextInputBuilder()
        	.setCustomId('description')
        	.setRequired(true)
        	.setPlaceholder('Be sure to be as detailed as possible so the developers can take action')
        	.setLabel('Describe the bug or abuse')
        	.setStyle(TextInputStyle.Paragraph);

        const one = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(command);
        const two = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(description);

        modal.addComponents(one, two);
        await interaction.showModal(modal);
        
	}catch(err)
    	{console.log(err)}
    }
} as ComponentModule;

