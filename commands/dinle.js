const {
  SlashCommandBuilder,

  ActionRowBuilder,
  EmbedBuilder,
  ButtonInteraction,
  CommandInteraction,
} = require("discord.js");
const axios = require("axios");
const slugify = require("slugify");
const getListenButtons = require("../helpers/get-listen-buttons");
const getErrorEmbed = require("../helpers/get-error-embed");
const { getVoiceConnection } = require("@discordjs/voice");

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

  autocomplete: async function (interaction) {
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

  /**
   * @param {ButtonInteraction} interaction
   */
  button: async function (interaction) {
    const connection = getVoiceConnection(interaction.guildId);
    if (interaction.customId === "kick") {
      connection.destroy();
      return await interaction.update({
        content: "Dinleme durduruldu",
        components: [],
      });
    }
  },
  /**
   * @param {CommandInteraction} interaction
   */
  execute: async function (interaction) {
    try {
      if (!interaction.member.voice.channelId)
        return await interaction.reply("Lütfen bir sesli kanala katılın.");

      const surah = +interaction.options.getString("sure");

      const { data } = await axios.get(
        `https://api.acikkuran.com/surah/${surah}`
      );

      new AudioPlayer(interaction, data);

      const { kick } = getListenButtons();

      const row = new ActionRowBuilder().addComponents(kick);
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`${data.data.id}.${data.data.name} Suresi`)
        .addFields(
          {
            name: "Ayet Sayısı",
            value: `${data.data.verse_count}`,
          },
          {
            name: "Sayfa Numarası",
            value: `${data.data.pageNumber}`,
          }
        )
        .setURL(`https://acikkuran.com/${data.data.id}`)
        .setAuthor({
          name: "Açık Kuran",
          iconURL: "https://acikkuran.com/images/icons/apple-icon-57x57.png",
          url: "https://acikkuran.com",
        });

      return await interaction.reply({
        content: "Ayet dinleniyor",
        components: [row],
        embeds: [embed],
      });
    } catch (error) {
      const embed = getErrorEmbed("HATA!", "Bir şeyler ters gitti.");
      await interaction.reply({
        embeds: [embed],
      });
    }
  },
};
