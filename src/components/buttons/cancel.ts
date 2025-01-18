import { ButtonInteraction, ChannelType, EmbedBuilder} from "discord.js";
import { Button } from '../../handler';

export default new Button({
    customId: "cancel",
    async execute(interaction: ButtonInteraction): Promise<void>{
	    if (!interaction.channel) return;
            if (interaction.channel.type !== ChannelType.GuildText) return;
	    await interaction.update({
                    embeds: [ new EmbedBuilder()
                            .setTitle("Action Cancelled")],
                    components: []
        })
    }
});
