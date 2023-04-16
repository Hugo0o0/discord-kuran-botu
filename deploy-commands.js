const path = require("path");
const fs = require("fs");
const { config } = require("dotenv");
const { REST, Routes } = require("discord.js");

config();

const commands = [];

const commandFilesPath = path.join(__dirname, "commands");
const commandFile = fs.readdirSync(commandFilesPath);

commandFile.forEach((file) => {
  const command = require(`${commandFilesPath}/${file}`);

  commands.push(command.data.toJSON());
});

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT, process.env.GUILD),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
