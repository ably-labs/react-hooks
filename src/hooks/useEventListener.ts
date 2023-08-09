import { Types } from 'ably';
import { useEffect } from 'react';

type EventListener<T> = (stateChange: T) => any;

export function useEventListener<
    S extends Types.ConnectionState | Types.ChannelState,
    C extends Types.ConnectionStateChange | Types.ChannelStateChange,
>(
    emitter: Types.EventEmitter<EventListener<C>, C, S>,
    listener: EventListener<C>,
    state?: S | S[]
) {
    useEffect(() => {
        const handleStateChange = (stateChange: C) => {
            if (
                !state ||
                state === stateChange.current ||
                (Array.isArray(state) &&
                    state.includes(stateChange.current as S))
            ) {
                if (listener) {
                    (listener as any)({
                        current: stateChange.current,
                        previous: stateChange.previous,
                        reason: stateChange.reason,
                    });
                }
            }
        };

        emitter.on(handleStateChange);

        return () => {
            emitter.off(handleStateChange);
        };
    }, [emitter, state, listener]);
}
