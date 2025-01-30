import { config } from "dotenv";
import { Bot } from "@twurple/easy-bot";
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
