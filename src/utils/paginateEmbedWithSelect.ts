import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} from 'discord.js';

async function paginateEmbedWithSelect(message, pages, timeout = 60000) {
  if (!pages || pages.length === 0) {
    return message.reply('❌ No pages to display.');
  }

  let currentPage = 0;

  const rowButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('prev').setLabel('◀️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('stop').setLabel('⏺️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('next').setLabel('▶️').setStyle(ButtonStyle.Secondary)
  );

  const rowSelect = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select_page')
      .setPlaceholder('Jump to page...')
      .addOptions(
        pages.map((_, i) => ({
          label: `Page ${i + 1}`,
          value: `${i}`
        }))
      )
  );

  const embedWithFooter = (index) => {
    return pages[index]
      .setFooter({ text: `Page ${index + 1} of ${pages.length}` })
      .setTimestamp();
  };

  const messageReply = await message.channel.send({
    embeds: [embedWithFooter(currentPage)],
    components: [rowButtons, rowSelect]
  });

  const collector = messageReply.createMessageComponentCollector({ time: timeout });

  collector.on('collect', async (interaction) => {
    if (interaction.user.id !== message.author.id) {
      return interaction.reply({ content: "❌ Only the command user can interact.", ephemeral: true });
    }

    if (interaction.isButton()) {
      if (interaction.customId === 'prev') {
        currentPage = currentPage > 0 ? currentPage - 1 : pages.length - 1;
      } else if (interaction.customId === 'next') {
        currentPage = (currentPage + 1) % pages.length;
      } else if (interaction.customId === 'stop') {
        await interaction.update({ components: [] });
        return collector.stop();
      }
      await interaction.update({ embeds: [embedWithFooter(currentPage)], components: [rowButtons, rowSelect] });
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'select_page') {
        currentPage = parseInt(interaction.values[0]);
        await interaction.update({ embeds: [embedWithFooter(currentPage)], components: [rowButtons, rowSelect] });
      }
    }
  });

  collector.on('end', () => {
    if (messageReply.editable) {
      messageReply.edit({ components: [] }).catch(() => {});
    }
  });
}



export { paginateEmbedWithSelect };

