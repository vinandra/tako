require("dotenv").config();
const { Client, Events, GatewayIntentBits } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const token = process.env.TOKEN;
const apiKey = process.env.API;
const targetChannelId = "1374548657163993239";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Client logged in as ${client.user.username}`);
  client.user.setActivity("Takoyaki 🚀");
});

client.on(Events.MessageCreate, async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Only respond in the specific channel
  if (message.channel.id !== targetChannelId) return;

  // Don't respond to empty messages
  if (!message.content.trim()) return;

  try {
    // Show typing indicator
    await message.channel.sendTyping();

    // Generate response using Gemini
    const result = await model.generateContent(message.content);
    const response = await result.response;
    let text = response.text();

    // If response is too long for Discord (2000 char limit), truncate it
    if (text.length > 1900) {
      text =
        text.substring(0, 1900) +
        "\n\n... *(respons terpotong karena terlalu panjang)*";
    }

    // Send as ONE single message
    await message.reply(text);
  } catch (error) {
    console.error("Error generating response:", error);

    // Handle different types of errors
    let errorMessage = "Maaf, terjadi kesalahan saat memproses pesan Anda. 😅";

    if (error.message) {
      if (
        error.message.includes("400") ||
        error.message.includes("Bad Request")
      ) {
        errorMessage = "Permintaan tidak valid. Coba dengan pesan lain! 🤔";
      } else if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        errorMessage = "Ada masalah dengan API key. Silakan hubungi admin! 🔑";
      } else if (
        error.message.includes("403") ||
        error.message.includes("Forbidden")
      ) {
        errorMessage = "Akses ditolak oleh API. 🚫";
      } else if (
        error.message.includes("429") ||
        error.message.includes("rate limit")
      ) {
        errorMessage = "Terlalu banyak permintaan. Tunggu sebentar ya! ⏳";
      } else if (
        error.message.includes("500") ||
        error.message.includes("Internal Server Error")
      ) {
        errorMessage = "Server API sedang bermasalah. Coba lagi nanti! 🛠️";
      } else if (
        error.message.includes("network") ||
        error.message.includes("timeout")
      ) {
        errorMessage = "Koneksi internet bermasalah. Coba lagi! 🌐";
      }
    }

    try {
      await message.reply(errorMessage);
    } catch (replyError) {
      console.error("Error sending error message:", replyError);
      // If even replying fails, just log it - don't crash the bot
    }
  }
});

// Handle uncaught errors to prevent bot crashes
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

client.login(token);
