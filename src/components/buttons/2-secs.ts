import { EmbedBuilder, ButtonInteraction, ChannelType} from "discord.js";
import { Button } from '../../handler';

export default new Button({
	customId: "2_sec",
	async execute(interaction: ButtonInteraction): Promise<void> {
		if (!interaction.channel) return;
		if (interaction.channel.type !== ChannelType.GuildText) return;
		await interaction.channel.setRateLimitPerUser(2)
		await interaction.update({
			embeds: [new EmbedBuilder()
				.setTitle("Slowmode On")
				.setDescription("2 Second Slowmode Enabled\n*to disable use ep slowoff*")],
			components: []
		})
	}
});
