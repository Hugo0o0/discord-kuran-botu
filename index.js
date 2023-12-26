const { config } = require("dotenv");
const {
  Client,
  GatewayIntentBits,
  Collection,
  FLagfs,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});
client.commands = new Collection();

const eventsPath = path.join(__dirname, "events");
const eventsFile = fs.readdirSync(eventsPath);

const commandsPath = path.join(__dirname, "commands");
const commandsFile = fs.readdirSync(commandsPath);

eventsFile.forEach((file) => {
  const event = require(`${eventsPath}/${file}`);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
});

commandsFile.forEach((file) => {
  const command = require(`${commandsPath}/${file}`);

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
});

client.login(process.env.TOKEN);
