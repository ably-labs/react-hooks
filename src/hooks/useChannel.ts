import { Types } from "ably";
import { useEffect } from 'react';
import { assertConfiguration } from "../AblyReactHooks";

export type AblyMessageCallback = (message: Types.Message) => void;
export type ChannelAndClient = [channel: Types.RealtimeChannelBase, message: Types.RealtimePromise];

export function useChannel(channelName: string, callbackOnMessage: AblyMessageCallback): ChannelAndClient;
export function useChannel(channelName: string, event: string, callbackOnMessage: AblyMessageCallback): ChannelAndClient;

export function useChannel(channelName: string, ...channelSubscriptionArguments: any[]): ChannelAndClient {
    const ably = assertConfiguration();

    const channel = ably.channels.get(channelName);

    const onMount = () => {
        channel.subscribe.apply(channel, channelSubscriptionArguments);
    }

    const onUnmount = () => {
        channel.unsubscribe(channelSubscriptionArguments);
    }

    const useEffectHook = () => {
        onMount();
        return () => { onUnmount(); };
    };

    useEffect(useEffectHook, []);

    return [channel, ably];
}