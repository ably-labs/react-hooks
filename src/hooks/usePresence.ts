import { Types } from "ably";
import { useEffect, useState } from 'react';
import { assertConfiguration } from "../AblyReactHooks.js";

export type PresenceDataAndPresenceUpdateFunction<T> = [
    presenceData: PresenceMessage<T>[],
    updateStatus: (messageOrPresenceObject: T) => void
];

export type OnPresenceMessageReceived<T> = (presenceData: PresenceMessage<T>) => void;
export type UseStatePresenceUpdate = (presenceData: Types.PresenceMessage[]) => void;

export function usePresence<T = any>(channelName: string, messageOrPresenceObject?: T, onPresenceUpdated?: OnPresenceMessageReceived<T>): PresenceDataAndPresenceUpdateFunction<T> {
    const ably = assertConfiguration();

    const [presenceData, updatePresenceData] = useState([]) as [Array<PresenceMessage<T>>, UseStatePresenceUpdate];
    const channel = ably.channels.get(channelName);

    const updatePresence = async (message?: Types.PresenceMessage) => {
        onPresenceUpdated?.call(this, message);

        const snapshot = await channel.presence.get();
        updatePresenceData(snapshot);
    }

    const onMount = async () => {
        channel.presence.subscribe('enter', updatePresence);
        channel.presence.subscribe('leave', updatePresence);
        channel.presence.subscribe('update', updatePresence);

        await channel.presence.enter(messageOrPresenceObject);

        const snapshot = await channel.presence.get();
        updatePresenceData(snapshot);
    }

    const onUnmount = () => {
        channel.presence.leave();
        channel.presence.unsubscribe('enter');
        channel.presence.unsubscribe('leave');
        channel.presence.unsubscribe('update');
    }

    const useEffectHook = () => {
        onMount();
        return () => { onUnmount(); };
    };

    useEffect(useEffectHook, []);
    
    const updateStatus = (messageOrPresenceObject: T) => {
        channel.presence.update(messageOrPresenceObject);
    };

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