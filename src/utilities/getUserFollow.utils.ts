import { ApiClient, HelixChannelFollower, HelixUser } from '@twurple/api';

/**
 * Retrieves information about a user and their follow status for a specific broadcaster's channel.
 * 
 * @param apiClient - The Twitch API client used to make API requests.
 * @param broadcasterChannel - The Helix user object representing the broadcaster's channel.
 * @param userToSearch - The username of the user to search for.
 * @returns A promise that resolves to either:
 *   - An object containing the user information and their follow status, or
 *   - A string message if the user is not found.
 */
export async function getUserFollow(apiClient: ApiClient, broadcasterChannel: HelixUser, userToSearch: string): Promise<{ user: HelixUser, userFollow: HelixChannelFollower | null} | string> {

    // Get user from name
    const user = await apiClient.users.getUserByName(userToSearch);

    // If user not found
    if (!user) return `Utilisateur introuvable : ${userToSearch}`;

    // Get follow status
    const chanelFollower = await broadcasterChannel?.getChannelFollower(user!)

    return {
        user: user,
        userFollow: chanelFollower
    }
}
