import Ably from 'ably';
import { Types } from 'ably';

export type ChannelNameAndOptions = {
    channelName: string;
    options?: Types.ChannelOptions;
    id?: string;
};
export type ChannelParameters = string | ChannelNameAndOptions;
