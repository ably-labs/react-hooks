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
    channelNameOrNameAndId: ChannelNameAndId | string,
    stateOrListener?:
        | Types.ChannelState
        | Types.ChannelState[]
        | ChannelStateListener,
    listener?: (stateChange: Types.ChannelStateChange) => any
) {
    const channelName =
        typeof channelNameOrNameAndId === 'string'
            ? channelNameOrNameAndId
            : channelNameOrNameAndId.id;
    const id = (channelNameOrNameAndId as ChannelNameAndId)?.id;

    const ably = useAbly(id);
    const channel = ably.channels.get(channelName);

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
