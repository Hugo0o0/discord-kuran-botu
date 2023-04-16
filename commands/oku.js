const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const slugify = require("slugify");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("oku")
    .setDescription("Sure seçimini yapın")
    .addStringOption((option) =>
      option
        .setName("sure")
        .setDescription("Sure seçin")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("ayet")
        .setDescription("Ayet numarasını girin")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("çevirmen")
        .setDescription("Çevirmen seçin")
        .setAutocomplete(true)
    ),
  autocomplete: async (interaction) => {
    const focusedOption = interaction.options.getFocused(true);
    const surahStr = slugify(focusedOption.value, { lower: true });
    let options;

    if (focusedOption.name === "sure") {
      const { data: surahs } = await axios.get(
        "https://api.acikkuran.com/surahs"
      );

      options = surahs.data
        .filter((surah) => surah.slug.includes(surahStr))
        .slice(0, 25);
    }

    if (focusedOption.name === "çevirmen") {
      const {
        data: { data: authors },
      } = await axios.get("https://api.acikkuran.com/authors");

      options = authors.filter((author) => {
        const authorName = slugify(author.name, { lower: true });
        const enteredAuthor = slugify(focusedOption.value, { lower: true });

        return authorName.includes(enteredAuthor);
      });
    }

    await interaction.respond(
      options.map((choice) => ({
        name: choice.name,
        value: `${choice.id}`,
      }))
    );
  },

  execute: async (interaction) => {
    const verse = +interaction.options.getInteger("ayet");
    const surah = +interaction.options.getString("sure");
    const author = +interaction.options.getInteger("çevirmen");

    const requestUrl =
      author === 0
        ? `https://api.acikkuran.com/surah/${surah}/verse/${verse}`
        : `https://api.acikkuran.com/surah/${surah}/verse/${verse}?author=${author}`;

    try {
      const {
        data: { data },
      } = await axios.get(requestUrl);

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`${data.surah.name} ${verse}. ayet`)
        .setDescription(data.translation.text)
        .setFooter({ text: data.translation.author.name })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (error) {
      console.log(`HATA ${error}`);

      const embed = new EmbedBuilder()
        .setColor(0xf20628)
        .setTitle("HATA")
        .setDescription(
          "Lütfen önerilen surelerden seçin ya da geçerli bir ayet numarası girin."
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
