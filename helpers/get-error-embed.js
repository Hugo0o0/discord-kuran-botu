const { EmbedBuilder } = require("discord.js");

module.exports = function getErrorEmbed(
  title = "HATA",
  description = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin."
) {
  return new EmbedBuilder()
    .setColor(0xf20628)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
};
