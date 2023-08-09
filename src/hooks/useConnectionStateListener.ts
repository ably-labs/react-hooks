import { Types } from 'ably';
import { ChannelParameters } from '../AblyReactHooks';
import { useEffect, useState } from 'react';
import { useAbly } from './useAbly';

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
    listener?: string | ConnectionStateListener,
    id: string = 'default'
) {
    const _id = typeof listener === 'string' ? listener : id;
    const ably = useAbly(_id);

    useEffect(() => {
        const handleStateChange = (
            stateChange: Types.ConnectionStateChange
        ) => {
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
                    (listener as ConnectionStateListener)({
                        current: stateChange.current,
                        previous: stateChange.previous,
                        reason: stateChange.reason,
                    });
                }
            }
        };

        ably.connection.on(handleStateChange);

        return () => {
            ably.connection.off(handleStateChange);
        };
    }, [ably, stateOrListener, listener]);
}
