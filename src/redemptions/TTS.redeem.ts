import { ApiClient, HelixUser } from '@twurple/api';
import { TTS } from "@services/textToSpeech.service";
import { TTSCore } from "cores/TTS.core";
import { getUserFollow } from 'utilities/getUserFollow.utils';
import { Bot } from '@twurple/easy-bot';
import { PubSubRedemptionMessage } from '@twurple/pubsub';

/**
 * This function handles the redemption of a Text-to-Speech (TTS) reward in a Twitch chat.
 * It checks if the user who made the redemption follows the broadcaster for at least 7 days,
 * and if so, it creates a TTS message using the provided message and user's name.
 * If the user does not follow the broadcaster or follows for less than 7 days,
 * it sends a private or public message to the user, and if the redemption contains a reward ID,
 * it refunds the redemption.
 *
 * @param bot - The Twitch bot instance.
 * @param apiClient - The Twitch API client instance.
 * @param broadcasterChannel - The broadcaster's Twitch channel information.
 * @param redeem - The redemption information, which can be either a PubSub message or an object with user name, message, and optional reward ID and redemption ID.
 * @returns A promise that resolves to a boolean indicating whether the redemption was successful.
 */
export async function redeemTTS(bot: Bot, apiClient: ApiClient, broadcasterChannel: HelixUser, redeem: { userName: string, message: string, rewardId?: undefined, id?: undefined} | PubSubRedemptionMessage): Promise<boolean> {
    const {userName, message} = redeem;

    // Retrieve user information
    const userInfo = await getUserFollow(apiClient, broadcasterChannel!, userName);

    // If user not found
    if (typeof userInfo === 'string') throw new Error(userInfo);

    // If user does not follow the broadcaster or follows for less than 7 days
    // Also check if the user isn't the broadcaster
    if (broadcasterChannel.id !== userInfo.user.id && (!userInfo.userFollow || userInfo.userFollow?.followDate.getTime() > (Date.now() - (6048e5)))) {
        try {
            // Send a private message
            await bot.whisper(redeem.userName, "Vous devez follow la chaine depuis plus de 7 jours pour pouvoir utiliser le TTS")
        } catch (error) {
            // Send a public message if can't DM
            await bot.say(broadcasterChannel.name, `@${redeem.userName} Vous devez follow la chaine depuis plus de 7 jours pour pouvoir utiliser le TTS`);
        }

        // If redemption contains a reward ID, then refund it, otherwise it's a test
        if (redeem.rewardId !== undefined) {
            await apiClient.channelPoints.updateRedemptionStatusByIds(broadcasterChannel.id, redeem.rewardId, [redeem.id], 'CANCELED' )
        }

        // Return the function status
        return false;
    }

    // Create a TTS instance
    const tts = new TTS(TTSCore);

    // Create the TTS message
    tts.speak(`${userName} a dit: ${message}`, userName);

    // Return the function status
    return true;
}
