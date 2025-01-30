import { ApiClient, HelixCustomReward, HelixUser } from '@twurple/api';

export class Reward {
    public id!: string;
    public broadcasterId!: string;
    public broadcasterName!: string;
    public broadcasterDisplayName!: string;
    public backgroundColor!: string;
    public isEnabled!: boolean;
    public cost!: number;
    public title!: string;
    public prompt!: string;
    public userInputRequired!: boolean;
    public maxRedemptionsPerStream!: number | null;
    public maxRedemptionsPerUserPerStream!: number | null;
    public globalCooldown!: number | null;
    public isPaused!: boolean;
    public isInStock!: boolean;
    public redemptionsThisStream: number | null = 0;
    public autoFulfill!: boolean;
    public cooldownExpiryDate!: Date | null;

    private _broadcaster: HelixUser;
    private _apiClient: ApiClient;

    constructor(broadcaster: HelixUser, apiClient: ApiClient) {
        this._broadcaster = broadcaster;
        this._apiClient = apiClient;
    }

    async getByName(name: string) {
        const rewards: HelixCustomReward[] = await this._apiClient.channelPoints.getCustomRewards(this._broadcaster.id);

        const reward = rewards.find(r => r.title === name);
    
        if (!reward) throw new Error(`Reward not found for ${name}`);

        this.getById(reward.id);
        
        return true;
    }

    async getById(id: string): Promise<boolean> {
        const reward: HelixCustomReward | null = await this._apiClient.channelPoints.getCustomRewardById(this._broadcaster.id, id);

        if (!reward) throw new Error(`Reward not found for ${id}`);

        this.id = reward.id;
        this.broadcasterId = reward.broadcasterId;
        this.broadcasterName = reward.broadcasterName;
        this.broadcasterDisplayName = reward.broadcasterDisplayName;
        this.backgroundColor = reward.backgroundColor;
        this.isEnabled = reward.isEnabled;
        this.cost = reward.cost;
        this.title = reward.title;
        this.prompt = reward.prompt;
        this.userInputRequired = reward.userInputRequired;
        this.maxRedemptionsPerStream = reward.maxRedemptionsPerStream;
        this.maxRedemptionsPerUserPerStream = reward.maxRedemptionsPerUserPerStream;
        this.globalCooldown = reward.globalCooldown;
        this.isPaused = reward.isPaused;
        this.isInStock = reward.isInStock;
        this.redemptionsThisStream = reward.redemptionsThisStream;
        this.autoFulfill = reward.autoFulfill;
        this.cooldownExpiryDate = reward.cooldownExpiryDate;

        return true;
    }

    /**
     * Deletes the custom reward associated with this instance from the broadcaster's channel.
     * 
     * This method uses the Twitch API to remove the custom reward identified by the current instance's ID.
     * If an error occurs during the deletion process, it is logged and re-thrown.
     * 
     * @throws {Error} If the reward deletion fails, an error is logged and thrown.
     * @returns {Promise<boolean>} A promise that resolves to true if the reward is successfully deleted.
     */
    async delete(): Promise<boolean> {
        try {
            this._apiClient.channelPoints.deleteCustomReward(this._broadcaster.id, this.id);
        } catch (err) {
            console.error(`Failed to delete reward: ${err}`);
            throw err;
        }

        return true;
    }


    /**
     * Creates a new custom reward for the broadcaster's channel using the current instance's properties.
     * 
     * This method uses the Twitch API to create a new custom reward with the properties set in the current Reward instance.
     * If the creation is successful, it updates the current instance with the newly created reward's data.
     * 
     * @throws {Error} If the reward creation fails, an error is logged and thrown.
     * @returns {Promise<boolean>} A promise that resolves to true if the reward is successfully created and the instance is updated.
     */
    async create(): Promise<boolean> {
        try {
            const reward = await this._apiClient.channelPoints.createCustomReward(this._broadcaster.id, {
                autoFulfill: this.autoFulfill,
                backgroundColor: this.backgroundColor,
                cost: this.cost,
                globalCooldown: this.globalCooldown,
                isEnabled: this.isEnabled,
                maxRedemptionsPerStream: this.maxRedemptionsPerStream,
                maxRedemptionsPerUserPerStream: this.maxRedemptionsPerUserPerStream,
                prompt: this.prompt,
                title: this.title,
                userInputRequired: this.userInputRequired
            });

            this.getById(reward.id);

        } catch (err) {
            console.error(`Failed to create reward: ${err}`);
            throw err;
        }

        return true;
    }


    set data(data: { 
        autoFulfill?: boolean
        backgroundColor?: string
        cost: number
        globalCooldown?: number | null
        isEnabled?: boolean
        maxRedemptionsPerStream?: number | null
        maxRedemptionsPerUserPerStream?: number | null
        prompt?: string
        title: string
        userInputRequired?: boolean
     }) {
        this.autoFulfill = data.autoFulfill ?? false;
        this.backgroundColor = data.backgroundColor ?? '#000000';
        this.cost = data.cost;
        this.globalCooldown = data.globalCooldown ?? 0;
        this.isEnabled = data.isEnabled ?? false;
        this.maxRedemptionsPerStream = data.maxRedemptionsPerStream ?? 0;
        this.maxRedemptionsPerUserPerStream = data.maxRedemptionsPerUserPerStream ?? 0;
        this.prompt = data.prompt ?? `${data.title} a été demandée`;
        this.title = data.title;
        this.userInputRequired = data.userInputRequired ?? false;
    }
}