import { Types } from 'ably';
import { useEffect, useMemo, useRef } from 'react';
import { ChannelParameters } from '../AblyReactHooks.js';
import { useAbly } from './useAbly';

export type AblyMessageCallback = (message: Types.Message) => void;
export type ChannelAndClient = [
    channel: Types.RealtimeChannelPromise,
    ably: Types.RealtimePromise
];

export function useChannel(
    channelNameOrNameAndOptions: ChannelParameters,
    callbackOnMessage: AblyMessageCallback
): ChannelAndClient;
export function useChannel(
    channelNameOrNameAndOptions: ChannelParameters,
    event: string,
    callbackOnMessage: AblyMessageCallback
): ChannelAndClient;

export function useChannel(
    channelNameOrNameAndOptions: ChannelParameters,
    ...channelSubscriptionArguments: any[]
): ChannelAndClient {
    const channelHookOptions =
        typeof channelNameOrNameAndOptions === 'object'
            ? channelNameOrNameAndOptions
            : { channelName: channelNameOrNameAndOptions };

    const ably = useAbly(channelHookOptions.id);

    const { channelName, options: channelOptions } = channelHookOptions;
    const channelOptionsRef = useRef(channelOptions);

    const channel = useMemo(
        () => ably.channels.get(channelName, channelOptionsRef.current),
        [channelName]
    );
    const onMount = async () => {
        await channel.subscribe.apply(channel, channelSubscriptionArguments);
    };

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
    };

    useEffect(() => {
        if (channelOptionsRef.current !== channelOptions) {
            channelOptionsRef.current = channelOptions;
            channel.setOptions(channelOptions);
        }
    }, [channelOptions]);

    const useEffectHook = () => {
        onMount();
        return () => {
            onUnmount();
        };
    };

    useEffect(useEffectHook, [channelHookOptions.channelName]);

    return [channel, ably];
}
