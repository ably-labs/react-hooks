import { Types } from 'ably';
import { ChannelParameters } from '../AblyReactHooks';
import { useEffect, useState } from 'react';
import { useAbly } from './useAbly';

export interface ChannelStateWithInfo {
    current: Types.ChannelState;
    previous: Types.ChannelState;
    reason: Types.ErrorInfo | null;
}

export function useChannelStateListener(
    channelNameOrNameAndOptions: ChannelParameters,
    state?: Types.ChannelState | Types.ChannelState[],
    listener?: (stateChange: ChannelStateWithInfo) => any
): ChannelStateWithInfo {
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
            ? ably.channels.get(channelName)
            : ably.channels.get(
                  channelName,
                  channelNameOrNameAndOptions.options
              );

    const [stateChangeInfo, setStateChangeInfo] =
        useState<ChannelStateWithInfo>({
            current: channel.state,
            previous: channel.state,
            reason: null,
        });

    useEffect(() => {
        const handleStateChange = (stateChange: Types.ChannelStateChange) => {
            if (
                !state ||
                state === stateChange.current ||
                (Array.isArray(state) && state.includes(stateChange.current))
            ) {
                setStateChangeInfo({
                    current: stateChange.current,
                    previous: stateChange.previous,
                    reason: stateChange.reason || null,
                });

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
    }, [channel, state, listener]);

    return stateChangeInfo;
}
