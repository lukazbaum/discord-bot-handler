import { ButtonInteraction, GuildChannel, ChannelType, EmbedBuilder} from "discord.js";
import { Button } from '../../handler';

export default new Button({
    customId: "45_sec",
    async execute(interaction: ButtonInteraction): Promise<void>{
	    if (!interaction.channel) return;
            if (interaction.channel.type !== ChannelType.GuildText) return;
	    await interaction.channel.setRateLimitPerUser(45)
	    await interaction.update({
                    embeds: [ new EmbedBuilder()
                            .setTitle("Slowmode On")
                            .setDescription("45 Second Slowmode Enabled\n*to disable use ep slowoff*") ],
                    components: []
        })
    }
});
