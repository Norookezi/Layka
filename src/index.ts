import { config } from "dotenv";
import { Bot, MessageEvent } from "@twurple/easy-bot";
import { AccessToken, RefreshingAuthProvider } from "@twurple/auth";


// Load environment variables from .env file
config();
const env = process.env;

const refreshingProvider = new RefreshingAuthProvider({
  clientId: env["clientId"]!,
  clientSecret: env["clientSecret"]!,
});

refreshingProvider.onRefresh(async (_userId: string, token: AccessToken) => {
  env["accessToken"] = token.accessToken;
});

await refreshingProvider.addUserForToken(
  {
    accessToken: env["accessToken"]!,
    refreshToken: env["refreshToken"]!,
    expiresIn: 0,
    obtainmentTimestamp: 0,
  },
  ["chat"]
);

const bot = new Bot({
  authProvider: refreshingProvider,
  channels: ["norookezi"],
});

bot.onConnect(() => {
  console.log("Connected to Twitch !");
});

bot.onMessage(async (msg: MessageEvent) => {
  if (!msg.text.startsWith("!")) return;

  const [command, ...args] = msg.text.substring(1).split(" ");

  switch (command) {
    default:
      break;
  }
});