import { Types } from 'ably';
import { useCallback, useEffect, useState } from 'react';
import { ChannelParameters } from '../AblyReactHooks.js';
import { useAbly } from './useAbly.js';

export type PresenceDataAndPresenceUpdateFunction<T> = [
    presenceData: PresenceMessage<T>[],
    updateStatus: (messageOrPresenceObject: T) => void
];

export type OnPresenceMessageReceived<T> = (
    presenceData: PresenceMessage<T>
) => void;
export type UseStatePresenceUpdate = (
    presenceData: Types.PresenceMessage[]
) => void;

export function usePresence<T = any>(
    channelNameOrNameAndOptions: ChannelParameters,
    messageOrPresenceObject?: T,
    onPresenceUpdated?: OnPresenceMessageReceived<T>
): PresenceDataAndPresenceUpdateFunction<T> {
    const params =
        typeof channelNameOrNameAndOptions === 'object'
            ? channelNameOrNameAndOptions
            : { channelName: channelNameOrNameAndOptions };

    const ably = useAbly(params.id);

    const subscribeOnly =
        typeof channelNameOrNameAndOptions === 'string'
            ? false
            : params.subscribeOnly;

    const channel = ably.channels.get(params.channelName, params.options);

    const [presenceData, updatePresenceData] = useState<
        Array<PresenceMessage<T>>
    >([]);

    const updatePresence = async (message?: Types.PresenceMessage) => {
        const snapshot = await channel.presence.get();
        updatePresenceData(snapshot);

        onPresenceUpdated?.call(this, message);
    };

    const onMount = async () => {
        channel.presence.subscribe('enter', updatePresence);
        channel.presence.subscribe('leave', updatePresence);
        channel.presence.subscribe('update', updatePresence);

        if (!subscribeOnly) {
            await channel.presence.enter(messageOrPresenceObject);
        }

        const snapshot = await channel.presence.get();
        updatePresenceData(snapshot);
    };

    const onUnmount = () => {
        if (channel.state == 'attached') {
            if (!subscribeOnly) {
                channel.presence.leave();
            }
        }
        channel.presence.unsubscribe('enter');
        channel.presence.unsubscribe('leave');
        channel.presence.unsubscribe('update');
    };

    const useEffectHook = () => {
        onMount();
        return () => {
            onUnmount();
        };
    };

    useEffect(useEffectHook, []);

    const updateStatus = useCallback(
        (messageOrPresenceObject: T) => {
            if (!subscribeOnly) {
                channel.presence.update(messageOrPresenceObject);
            } else {
                throw new Error(
                    'updateStatus can not be called while using the hook in subscribeOnly mode'
                );
            }
        },
        [channel]
    );

    return [presenceData, updateStatus];
}

interface PresenceMessage<T = any> {
    action: Types.PresenceAction;
    clientId: string;
    connectionId: string;
    data: T;
    encoding: string;
    id: string;
    timestamp: number;
}
