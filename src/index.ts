import { ApiClient, HelixUser } from "@twurple/api";
import { config } from "dotenv";
import { Bot, MessageEvent } from "@twurple/easy-bot";
import { AccessToken, RefreshingAuthProvider } from "@twurple/auth";
import { PubSubClient, PubSubRedemptionMessage } from "@twurple/pubsub";
import { redeemTTS } from "redemptions/TTS.redeem";
import { getUser } from "@commands/get";
import { Http } from 'httpServer';
import { Reward } from '@utils/reward';

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

const bot: Bot = new Bot({
  authProvider: refreshingProvider,
  channels: [env["channelName"]!],
});
const pubSubClient = new PubSubClient({ authProvider: refreshingProvider });
const apiClient = new ApiClient({ authProvider: refreshingProvider });
const broadcasterChannel: HelixUser | null = await apiClient.users.getUserById(
  env["channelId"]!
);

if (!(await apiClient.channelPoints.getCustomRewards(broadcasterChannel!.id)).find(reward => reward.title === "TTS")) {
    try {
        const redeemTTS = new Reward(broadcasterChannel!, apiClient);
      
        redeemTTS.data = {
          autoFulfill: false,
          backgroundColor: "#c868f5",
          cost: 10,
          globalCooldown: 60, //Cooldown in seconds
          isEnabled: true,
          maxRedemptionsPerStream: 0, // Max number of redemptions per stream
          maxRedemptionsPerUserPerStream: 0,
          prompt: "Un bot lira votre message en live (Followers depuis +7 jours)",
          title: "TTS",
          userInputRequired: true,
        };
      
        redeemTTS.create();

    } catch (err) {
        console.error(`Failed to create reward: ${err}`);
        throw err;
    }

}

bot.onConnect(() => {
  console.log("Connected to Twitch !");
});

bot.onMessage(async (msg: MessageEvent) => {
  if (!msg.text.startsWith("!")) return;

  const [command, ...args] = msg.text.substring(1).split(" ");

  switch (command) {
    case "get":
      await getUser(apiClient, broadcasterChannel!, msg, args);
      break;

    default:
      break;
  }
});

pubSubClient.onRedemption(
  env["channelId"]!,
  async (redeem: PubSubRedemptionMessage) => {
    const { rewardTitle } = redeem;

    // console.log('Redeem received:', rewardTitle, message, );

    switch (rewardTitle) {
      case "TTS":
        await redeemTTS(bot, apiClient, broadcasterChannel!, redeem);
        break;
    }
  }
);
