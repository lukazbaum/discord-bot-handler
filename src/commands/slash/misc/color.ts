import { type ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { BackgroundColor, Color, ColoredMessageBuilder, Format, RegisterType, SlashCommand } from '../../../handler';

export default new SlashCommand({
  registerType: RegisterType.Guild,

  data: new SlashCommandBuilder()
    .setName('color')
    .setDescription('Replies with a colorful message example!')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const coloredMessage: string = new ColoredMessageBuilder()
      .add('Welcome to the ', Color.Green)
      .add('Color Showcase!', Color.Blue, BackgroundColor.Orange, Format.Bold)
      .addNewLine()
      .add('This text is ', Color.Red)
      .add('red ', Color.Red, BackgroundColor.None, Format.Bold)
      .add('with an underline.', Color.Gray, BackgroundColor.None, Format.Underline)
      .addNewLine()
      .add('Let’s ', Color.White)
      .add('explore ', Color.Cyan, BackgroundColor.None, Format.Bold)
      .add('a ', Color.Yellow)
      .addRainbow('rainbow ')
      .add('effect: ', Color.Pink)
      .addRainbow('rainboooooooow!', Format.Normal)
      .addNewLine()
      .add('Thanks for using the command!', Color.Cyan, BackgroundColor.MarbleBlue, Format.Bold)
      .build();

    await interaction.reply({ content: coloredMessage });
  },
});
