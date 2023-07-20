import { Types } from 'ably';
import { ChannelParameters } from '../AblyReactHooks.js';

import { useEffect, useState } from 'react';
import { useAbly } from './useAbly';

export function useConnectionState(
    channelNameOrNameAndOptions: ChannelParameters
): Types.ConnectionState {
    const ably = useAbly(
        typeof channelNameOrNameAndOptions === 'object'
            ? channelNameOrNameAndOptions.id
            : undefined
    );

    const [connectionState, setConnectionState] = useState(
        ably.connection.state
    );

    useEffect(() => {
        const handleStateChange = (state) => {
            setConnectionState(state.current);
        };

        ably.connection.on(handleStateChange);

        return () => {
            ably.connection.off(handleStateChange);
        };
    }, [ably]);

    return connectionState;
}
