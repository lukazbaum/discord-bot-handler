import { AnySelectMenuInteraction, ModalSubmitInteraction } from "discord.js";
import { ComponentModule, ComponentTypes } from "../../handler/types/Component";

export = {
    id: "modalExample",
    type: ComponentTypes.Modal,
    async execute(interaction: ModalSubmitInteraction): Promise<void> {
        const favoriteColor: string = interaction.fields.getTextInputValue("favoriteColorInput");
        await interaction.reply({ content: `Your favorite color: ${favoriteColor}` });
    }
} as ComponentModule;