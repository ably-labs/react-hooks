import { Types } from "ably";
import { useEffect, useState } from 'react';
import { assertConfiguration, ChannelParameters } from "../AblyReactHooks.js";

export type PresenceDataAndPresenceUpdateFunction<T> = [
    presenceData: PresenceMessage<T>[],
    updateStatus: (messageOrPresenceObject: T) => void
];

export type OnPresenceMessageReceived<T> = (presenceData: PresenceMessage<T>) => void;
export type UseStatePresenceUpdate = (presenceData: Types.PresenceMessage[]) => void;

export function usePresence<T = any>(channelNameOrNameAndOptions: ChannelParameters, messageOrPresenceObject?: T, onPresenceUpdated?: OnPresenceMessageReceived<T>): PresenceDataAndPresenceUpdateFunction<T> {
    const ably = assertConfiguration();

    const channelName = typeof channelNameOrNameAndOptions === 'string'
        ? channelNameOrNameAndOptions 
        : channelNameOrNameAndOptions.channelName;

    const channel = typeof channelNameOrNameAndOptions === 'string'
        ? ably.channels.get(channelName) 
        : ably.channels.get(channelName, channelNameOrNameAndOptions.options);

    const [presenceData, updatePresenceData] = useState([]) as [Array<PresenceMessage<T>>, UseStatePresenceUpdate];

    const updatePresence = async (message?: Types.PresenceMessage) => {
        const snapshot = await channel.presence.get();
        updatePresenceData(snapshot);
        
        onPresenceUpdated?.call(this, message);
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
