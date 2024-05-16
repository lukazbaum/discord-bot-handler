import { ButtonInteraction, GuildChannel, ChannelType, EmbedBuilder} from "discord.js";
import { ComponentModule, ComponentTypes } from "../../handler/types/Component";

export = {
    id: "10_sec",
    type: ComponentTypes.Button,
    async execute(interaction: ButtonInteraction): Promise<void>{
	    if (!interaction.channel) return;
            if (interaction.channel.type !== ChannelType.GuildText) return;
	    await interaction.channel.setRateLimitPerUser(10)
	    await interaction.update({
                    embeds: [ new EmbedBuilder()
                            .setTitle("Slowmode On")
                            .setDescription("10 Second Slowmode Enabled\n*to disable use ep slowoff*") ],
                    components: []
        })
    }
} as ComponentModule;
