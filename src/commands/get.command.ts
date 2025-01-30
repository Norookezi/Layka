import { ApiClient, HelixUser } from '@twurple/api';
import { MessageEvent } from '@twurple/easy-bot';
import { getUserFollow } from 'utilities/getUserFollow.utils';

/**
 * Retrieves information about a user and their follow status for a specific broadcaster's channel.
 * 
 * @param apiClient - The Twitch API client used to make API requests.
 * @param broadcasterChannel - The Helix user object representing the broadcaster's channel.
 * @param msg - The message event that triggered the command.
 * @param args - An array of string arguments passed with the command.  args should be the username.
 * @returns A promise that resolves to void.  The function sends a reply via the `msg` object.
 */
export async function getUser(apiClient: ApiClient, broadcasterChannel: HelixUser, msg: MessageEvent, args: String[]) {
    if (args.length == 0) return msg.reply("Vous devez fournir un pseudo")
                    
                const userInfo = await getUserFollow(apiClient, broadcasterChannel!, args[0].replace('@', ''));
    
                if (typeof userInfo === 'string') return msg.reply(userInfo)
    
                const { user, userFollow } = userInfo;

                const reply: string = `
                ${user.displayName} ${userFollow ? ` follow la chaine depuis le ${userFollow.followDate.getDate()}/${("0" + (userFollow.followDate.getMonth() + 1).toString()).slice(-2) }/${userFollow.followDate.getFullYear()}`: ' ne follow pas la chaine'}
                `;
    
                msg.reply(reply);
}