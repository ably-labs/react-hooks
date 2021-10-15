import { Types } from "ably";
import { useEffect, useState } from 'react';
import { assertConfiguration } from "../AblyReactHooks";

export type PresenceDataAndPresenceUpdateFunction = [
    presenceData: Types.PresenceMessage[],
    updateStatus: (message: string) => void
];

export function usePresence(channelName: string, statusMessage?: string): PresenceDataAndPresenceUpdateFunction {
    const ably = assertConfiguration();

    const [presenceData, updatePresenceData] = useState([]);
    const channel = ably.channels.get(channelName);

    const updatePresence = async () => {
        updatePresenceData(await channel.presence.get());
    }

    const updateStatus = (message: string) => {
        channel.presence.update(message);
    };

    const onMount = async () => {
        channel.presence.subscribe('enter', updatePresence);
        channel.presence.subscribe('leave', updatePresence);
        channel.presence.subscribe('update', updatePresence);

        await channel.presence.enter(statusMessage || "");
        updatePresenceData(await channel.presence.get());
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

    return [presenceData, updateStatus];
}
