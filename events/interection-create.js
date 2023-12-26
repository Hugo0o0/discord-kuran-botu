const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  execute: async (interaction) => {
    const command = interaction.client.commands.get(
      interaction?.commandName || interaction.message.interaction?.commandName
    );

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }
    if (interaction.isChatInputCommand()) {
      try {
        await command.execute(interaction);
      } catch (error) {
        console.log(`HATA chat ${error}`);
      }
    }
    if (interaction.isAutocomplete()) {
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.log(`Hata auto ${error}`);
      }
    }
  },
};
