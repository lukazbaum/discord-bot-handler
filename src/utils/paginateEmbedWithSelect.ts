import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  EmbedBuilder,
  Message,
  ComponentType
} from 'discord.js';

async function paginateEmbedWithSelect(message: Message, pages: EmbedBuilder[], timeout = 60000) {
  if (!pages || pages.length === 0) {
    return message.reply('❌ No pages to display.');
  }

  let currentPage = 0;
  let contentNonce = 0;
  const sessionId = `localpg_${Math.random().toString(36).substring(2, 8)}`;

  const embedWithFooter = (index: number) => {
    return pages[index]
      .setFooter({ text: `Page ${index + 1} of ${pages.length}` })
      .setTimestamp();
  };

  const createRows = () => {
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`${sessionId}_b`).setLabel('◀️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`${sessionId}_s`).setLabel('⏺️').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`${sessionId}_f`).setLabel('▶️').setStyle(ButtonStyle.Secondary)
    );

    const select = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`${sessionId}_select`)
        .setPlaceholder('Jump to page...')
        .addOptions(
          pages.map((_, i) => ({
            label: `Page ${i + 1}`,
            value: `${i}`
          }))
        )
    );

    return [buttons, select];
  };

  const messageReply = await message.reply({
    embeds: [embedWithFooter(currentPage)],
    components: createRows(),
    content: `Page ${currentPage + 1} • ${contentNonce++}`
  });

  console.log(`[Collector] Started session ${sessionId} for ${message.author.username}`);

  const collector = messageReply.createMessageComponentCollector({
    time: timeout,
    componentType: ComponentType.Button
  });

  const selectCollector = messageReply.createMessageComponentCollector({
    time: timeout,
    componentType: ComponentType.StringSelect
  });

  collector.on('collect', async (interaction) => {
    console.log(`[Collector ${sessionId}] Received interaction: ${interaction.customId}`);
    if (interaction.user.id !== message.author.id) {
      return interaction.reply({ content: "❌ Only the command user can interact.", ephemeral: true });
    }

    try {
      await interaction.deferUpdate();

      if (interaction.customId === `${sessionId}_b`) {
        currentPage = currentPage > 0 ? currentPage - 1 : pages.length - 1;
      } else if (interaction.customId === `${sessionId}_f`) {
        currentPage = (currentPage + 1) % pages.length;
      } else if (interaction.customId === `${sessionId}_s`) {
        await interaction.editReply({ components: [], content: '⏹️ Pagination ended.' });
        collector.stop();
        selectCollector.stop();
        return;
      }

      await interaction.editReply({
        content: `Page ${currentPage + 1} • ${contentNonce++}`,
        embeds: [embedWithFooter(currentPage)],
        components: createRows()
      });
    } catch (err: any) {
      if (err.code === 10062) {
        console.warn("⚠️ Interaction expired or invalid (code 10062).");
        return;
      }
      console.error("❌ Pagination interaction error:", err);
    }
  });

  selectCollector.on('collect', async (interaction) => {
    console.log(`[Collector ${sessionId}] Received interaction: ${interaction.customId}`);
    if (interaction.user.id !== message.author.id) {
      return interaction.reply({ content: "❌ Only the command user can interact.", ephemeral: true });
    }

    try {
      await interaction.deferUpdate();

      const selected = parseInt(interaction.values[0]);
      currentPage = selected;

      await interaction.editReply({
        content: `Page ${currentPage + 1} • ${contentNonce++}`,
        embeds: [embedWithFooter(currentPage)],
        components: createRows()
      });
    } catch (err: any) {
      if (err.code === 10062) {
        console.warn("⚠️ Select menu interaction expired (code 10062).");
        return;
      }
      console.error("❌ Select menu interaction error:", err);
    }
  });

  const onEnd = async () => {
    if (messageReply.editable) {
      try {
        const disabledButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId(`${sessionId}_b`).setLabel('◀️').setStyle(ButtonStyle.Secondary).setDisabled(true),
          new ButtonBuilder().setCustomId(`${sessionId}_s`).setLabel('⏺️').setStyle(ButtonStyle.Danger).setDisabled(true),
          new ButtonBuilder().setCustomId(`${sessionId}_f`).setLabel('▶️').setStyle(ButtonStyle.Secondary).setDisabled(true)
        );

        await messageReply.edit({
          content: '⏳ Pagination session expired.',
          components: [disabledButtons]
        });
      } catch (err) {
        console.warn("⚠️ Failed to disable buttons on timeout:", err);
      }
    }
  };

  collector.on('end', onEnd);
  selectCollector.on('end', onEnd);
}

export { paginateEmbedWithSelect };