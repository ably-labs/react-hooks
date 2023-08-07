import { Types } from 'ably';
import React from 'react';
import { contextKey, getContext } from '../AblyProvider';

export function useAbly(id: string = 'default'): Types.RealtimePromise {
    const client = React.useContext(getContext(id)) as Types.RealtimePromise;

    if (!client) {
        throw new Error(
            'Could not find ably client in context. ' +
                'Make sure your ably hooks are called inside an <AblyProvider>'
        );
    }

    return client;
}
