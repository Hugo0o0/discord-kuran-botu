const { ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = function () {
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

  return {
    stop,
    play,
    kick,
  };
};
