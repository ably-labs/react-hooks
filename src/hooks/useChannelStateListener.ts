import { Types } from 'ably';
import { ChannelNameAndId } from '../AblyReactHooks';
import { useEffect, useState } from 'react';
import { useAbly } from './useAbly';
import { useEventListener } from './useEventListener';

type ChannelStateListener = (stateChange: Types.ChannelStateChange) => any;

export function useChannelStateListener(
    channelName: string,
    listener?: ChannelStateListener
);

export function useChannelStateListener(
    options: ChannelNameAndId,
    state?: Types.ChannelState | Types.ChannelState[],
    listener?: ChannelStateListener
);

export function useChannelStateListener(
    channelNameOrNameAndOptions: ChannelNameAndId | string,
    stateOrListener?:
        | Types.ChannelState
        | Types.ChannelState[]
        | ChannelStateListener,
    listener?: (stateChange: Types.ChannelStateChange) => any
) {
    const ably = useAbly(
        typeof channelNameOrNameAndOptions === 'object'
            ? channelNameOrNameAndOptions.id
            : undefined
    );

    const channel =
        typeof channelNameOrNameAndOptions === 'string'
            ? ably.channels.get(channelNameOrNameAndOptions)
            : ably.channels.get(channelNameOrNameAndOptions.channelName);

    const _listener =
        typeof listener === 'function'
            ? listener
            : (stateOrListener as ChannelStateListener);

    const state =
        typeof stateOrListener !== 'function' ? stateOrListener : undefined;

    useEventListener<Types.ChannelState, Types.ChannelStateChange>(
        channel,
        _listener,
        state
    );
}
