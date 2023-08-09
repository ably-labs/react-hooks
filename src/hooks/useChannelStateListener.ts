import { Types } from 'ably';
import { ChannelParameters } from '../AblyReactHooks';
import { useAbly } from './useAbly';
import { useEventListener } from './useEventListener';

type ChannelStateListener = (stateChange: Types.ChannelStateChange) => any;

export function useChannelStateListener(
    channelNameOrNameAndOptions: ChannelParameters,
    listener?: ChannelStateListener
);

export function useChannelStateListener(
    channelNameOrNameAndOptions: ChannelParameters,
    state?: Types.ChannelState | Types.ChannelState[],
    listener?: ChannelStateListener
);

export function useChannelStateListener(
    channelNameOrNameAndOptions: ChannelParameters,
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
            : ably.channels.get(
                  channelNameOrNameAndOptions.channelName,
                  channelNameOrNameAndOptions.options
              );

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
