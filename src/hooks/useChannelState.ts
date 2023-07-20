import { Types } from 'ably';
import { ChannelParameters } from '../AblyReactHooks';
import { useEffect, useState } from 'react';
import { useAbly } from './useAbly';

export function useChannelState(
    channelNameOrNameAndOptions: ChannelParameters
): Types.ChannelState {
    const ably = useAbly(
        typeof channelNameOrNameAndOptions === 'object'
            ? channelNameOrNameAndOptions.id
            : undefined
    );

    const channelName =
        typeof channelNameOrNameAndOptions === 'string'
            ? channelNameOrNameAndOptions
            : channelNameOrNameAndOptions.channelName;

    const channel =
        typeof channelNameOrNameAndOptions === 'string'
            ? ably.channels.get(channelName)
            : ably.channels.get(
                  channelName,
                  channelNameOrNameAndOptions.options
              );

    const [channelState, setChannelState] = useState(channel.state);

    useEffect(() => {
        const handleStateChange = (stateChange) => {
            setChannelState(stateChange.current);
        };

        channel.on(
            [
                'initialized',
                'attaching',
                'attached',
                'detaching',
                'detached',
                'suspended',
                'failed',
                'update',
            ],
            handleStateChange
        );

        return () => {
            channel.off('initialized', handleStateChange);
            channel.off('attaching', handleStateChange);
            channel.off('attached', handleStateChange);
            channel.off('detaching', handleStateChange);
            channel.off('detached', handleStateChange);
            channel.off('suspended', handleStateChange);
            channel.off('failed', handleStateChange);
            channel.off('update', handleStateChange);
        };
    }, [channel]);

    return channelState;
}
