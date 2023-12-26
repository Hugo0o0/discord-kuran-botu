const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const axios = require("axios");
const slugify = require("slugify");

const AudioPlayer = require("../helpers/AudioPlayer");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dinle")
    .setDescription("Ayet dinle")
    .addStringOption((option) =>
      option
        .setName("sure")
        .setDescription("Sure seçin")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  autocomplete: async (interaction) => {
    const focusedOption = interaction.options.getFocused(true);
    const surahStr = slugify(focusedOption.value, { lower: true });
    let options;

    const { data: surahs } = await axios.get(
      "https://api.acikkuran.com/surahs"
    );

    options = surahs.data
      .filter((surah) => surah.slug.includes(surahStr))
      .slice(0, 25);

    await interaction.respond(
      options.map((choice) => ({
        name: choice.name,
        value: `${choice.id}`,
      }))
    );
  },

  execute: async (interaction) => {
    try {
      const surah = +interaction.options.getString("sure");

      const { data } = await axios.get(
        `https://api.acikkuran.com/surah/${surah}`
      );

      const { player, connection } = new AudioPlayer(interaction, data);

      const stop = new ButtonBuilder()
        .setCustomId("stop")
        .setLabel("Durdur")
        .setStyle(ButtonStyle.Danger);
      const play = new ButtonBuilder()
        .setCustomId("play")
        .setLabel("Oynat")
        .setStyle(ButtonStyle.Success);

      const kick = new ButtonBuilder()
        .setCustomId("kick")
        .setLabel("Bağlantıyı kes")
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(stop, play, kick);

      interaction.client.on(
        "interactionCreate",
        async function (buttonInteraction) {
          if (!buttonInteraction.isButton()) return;

          if (buttonInteraction.customId === "stop") {
            player.pause();
            await buttonInteraction.update("Ayet dinleme durduruldu");
          } else if (buttonInteraction.customId === "play") {
            player.unpause();
            await buttonInteraction.update("Ayet dinleniyor");
          } else if (buttonInteraction.customId === "kick") {
            connection.destroy();
            await buttonInteraction.update("Bot bağlantısı kesildi");
          }
        }
      );

      return await interaction.reply({
        content: "Ayet dinleniyor",
        components: [row],
      });
    } catch (error) {
      console.log(error);
      await interaction.reply("Dinleme özelliği şu anda aktif değildir.");
    }
  },
};
