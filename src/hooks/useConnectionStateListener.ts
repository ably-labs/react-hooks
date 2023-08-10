import { Types } from 'ably';
import { ChannelParameters } from '../AblyReactHooks';
import { useAbly } from './useAbly';
import { useEventListener } from './useEventListener';

type ConnectionStateListener = (
    stateChange: Types.ConnectionStateChange
) => any;

export function useConnectionStateListener(
    listener: ConnectionStateListener,
    id?: string
);

export function useConnectionStateListener(
    state: Types.ConnectionState | Types.ConnectionState[],
    listener: ConnectionStateListener,
    id?: string
);

export function useConnectionStateListener(
    stateOrListener?:
        | Types.ConnectionState
        | Types.ConnectionState[]
        | ConnectionStateListener,
    listenerOrId?: string | ConnectionStateListener,
    id: string = 'default'
) {
    const _id = typeof listenerOrId === 'string' ? listenerOrId : id;
    const ably = useAbly(_id);

    const listener =
        typeof listenerOrId === 'function'
            ? listenerOrId
            : (stateOrListener as ConnectionStateListener);
    const state =
        typeof stateOrListener !== 'function' ? stateOrListener : undefined;

    useEventListener<Types.ConnectionState, Types.ConnectionStateChange>(
        ably.connection,
        listener,
        state
    );
}