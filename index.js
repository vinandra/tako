require("dotenv").config();
const { Client, Events, GatewayIntentBits } = require("discord.js");
const token = process.env.TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`client logged as ${client.user.username}`);
  client.user.setActivity("Takoyaki 🚀");
});

client.login(token);
