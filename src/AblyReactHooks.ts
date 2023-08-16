import { Types } from 'ably';

export type ChannelNameAndOptions = {
    channelName: string;
    options?: Types.ChannelOptions;
    id?: string;
    subscribeOnly?: boolean;
    onConnectionError?: (error: Types.ErrorInfo) => unknown;
    onChannelError?: (error: Types.ErrorInfo) => unknown;
};

export type ChannelNameAndId = {
    channelName: string;
    id?: string;
};
export type ChannelParameters = string | ChannelNameAndOptions;
