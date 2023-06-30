import { Types } from "ably";
import { useEffect } from 'react';
import { assertConfiguration, ChannelParameters } from "../AblyReactHooks.js";

export type AblyMessageCallback = (message: Types.Message) => void;
export type ChannelAndClient = [channel: Types.RealtimeChannelPromise, message: Types.RealtimePromise];

export function useChannel(channelNameOrNameAndOptions: ChannelParameters, callbackOnMessage?: AblyMessageCallback): ChannelAndClient;
export function useChannel(channelNameOrNameAndOptions: ChannelParameters, event: string, callbackOnMessage?: AblyMessageCallback): ChannelAndClient;

export function useChannel(channelNameOrNameAndOptions: ChannelParameters, ...channelSubscriptionArguments: any[]): ChannelAndClient {
    const ably = typeof channelNameOrNameAndOptions === 'string'
      ? assertConfiguration()
      : (channelNameOrNameAndOptions.realtime || assertConfiguration())

    const channelName = typeof channelNameOrNameAndOptions === 'string'
        ? channelNameOrNameAndOptions 
        : channelNameOrNameAndOptions.channelName;

    const channel = typeof channelNameOrNameAndOptions === 'string'
        ? ably.channels.get(channelName) 
        : ably.channels.get(channelName, channelNameOrNameAndOptions.options);

    const onMount = async () => {
        await channel.subscribe.apply(channel, channelSubscriptionArguments);
    }

    const onUnmount = async () => {
        await channel.unsubscribe.apply(channel, channelSubscriptionArguments);
        
        setTimeout(async () => {
            // React is very mount/unmount happy, so if we just detatch the channel
            // it's quite likely it will be reattached again by a subsequent onMount calls.
            // To solve this, we set a timer, and if all the listeners have been removed, we know that the component
            // has been removed for good and we can detatch the channel.

            if (channel.listeners.length === 0) {
                await channel.detach();
            }
        }, 2500);
    }

    const useEffectHook = () => {
        onMount();
        return () => { onUnmount(); };
    };

    useEffect(useEffectHook, [channelName]);

    return [channel, ably];
}
