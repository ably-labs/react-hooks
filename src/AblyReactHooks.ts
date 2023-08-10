import { Types } from 'ably';

export type ChannelNameAndOptions = {
    channelName: string;
    options?: Types.ChannelOptions;
    id?: string;
};

export type ChannelNameAndId = {
    channelName: string;
    id?: string;
};

export type ChannelParameters = string | ChannelNameAndOptions;
