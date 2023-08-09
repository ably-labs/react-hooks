import { Types } from 'ably';
import { useEffect, useState } from 'react';
import { ChannelNameAndId } from '../AblyReactHooks';
import { useAbly } from './useAbly';

export interface ChannelStateWithInfo {
    current: Types.ChannelState;
    previous: Types.ChannelState;
    reason: Types.ErrorInfo | null;
}

export function useChannelStateListener(
    channelName: string,
    listener?: (stateChange: ChannelStateWithInfo) => any
);

export function useChannelStateListener(
    options: ChannelNameAndId,
    state?: Types.ChannelState | Types.ChannelState[],
    listener?: (stateChange: ChannelStateWithInfo) => any
);

export function useChannelStateListener(
    channelNameOrNameAndOptions: ChannelNameAndId | string,
    stateOrListener?:
        | Types.ChannelState
        | Types.ChannelState[]
        | ((stateChange: ChannelStateWithInfo) => any),
    listener?: (stateChange: ChannelStateWithInfo) => any
) {
    const ably = useAbly(
        typeof channelNameOrNameAndOptions === 'object'
            ? channelNameOrNameAndOptions.id
            : undefined
    );

    const channelName =
        typeof channelNameOrNameAndOptions === 'string'
            ? channelNameOrNameAndOptions
            : channelNameOrNameAndOptions.channelName;

    const channel =
        typeof channelNameOrNameAndOptions === 'string'
            ? ably.channels.get(channelNameOrNameAndOptions)
            : ably.channels.get(channelNameOrNameAndOptions.channelName);

    useEffect(() => {
        const handleStateChange = (stateChange: Types.ChannelStateChange) => {
            if (typeof stateOrListener === 'function') {
                listener = stateOrListener;
                stateOrListener = undefined;
            }

            if (
                !stateOrListener ||
                stateOrListener === stateChange.current ||
                (Array.isArray(stateOrListener) &&
                    stateOrListener.includes(stateChange.current))
            ) {
                if (listener) {
                    listener({
                        current: stateChange.current,
                        previous: stateChange.previous,
                        reason: stateChange.reason || null,
                    });
                }
            }
        };

        channel.on(handleStateChange);

        return () => {
            channel.off(handleStateChange);
        };
    }, [channel, stateOrListener, listener]);
}
