import React from 'react';
import { it, beforeEach, describe, expect, vi } from 'vitest';
import { useChannel } from './useChannel';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { FakeAblySdk, FakeAblyChannels } from '../fakes/ably';
import { Types } from 'ably';
import { act } from 'react-dom/test-utils';
import { AblyProvider } from '../AblyProvider';

function renderInCtxProvider(
    client: FakeAblySdk,
    children: React.ReactNode | React.ReactNode[]
) {
    return render(
        <AblyProvider client={client as unknown as Types.RealtimePromise}>
            {children}
        </AblyProvider>
    );
}

describe('useChannel', () => {
    let channels: FakeAblyChannels;
    let ablyClient: FakeAblySdk;
    let otherClient: FakeAblySdk;

    beforeEach(() => {
        channels = new FakeAblyChannels(['blah']);
        ablyClient = new FakeAblySdk().connectTo(channels);
        otherClient = new FakeAblySdk().connectTo(channels);
    });

    it('component can useChannel and renders nothing by default', async () => {
        renderInCtxProvider(
            ablyClient,
            <UseChannelComponent></UseChannelComponent>
        );
        const messageUl = screen.getAllByRole('messages')[0];

        expect(messageUl.childElementCount).toBe(0);
    });

    it('component updates when message arrives', async () => {
        renderInCtxProvider(
            ablyClient,
            <UseChannelComponent></UseChannelComponent>
        );

        await act(async () => {
            otherClient.channels.get('blah').publish({ text: 'message text' });
        });

        const messageUl = screen.getAllByRole('messages')[0];
        expect(messageUl.childElementCount).toBe(1);
        expect(messageUl.children[0].innerHTML).toBe('message text');
    });

    it('component updates when multiple messages arrive', async () => {
        renderInCtxProvider(
            ablyClient,
            <UseChannelComponent></UseChannelComponent>
        );

        await act(async () => {
            otherClient.channels.get('blah').publish({ text: 'message text1' });
            otherClient.channels.get('blah').publish({ text: 'message text2' });
        });

        const messageUl = screen.getAllByRole('messages')[0];
        expect(messageUl.children[0].innerHTML).toBe('message text1');
        expect(messageUl.children[1].innerHTML).toBe('message text2');
    });

    it('useChannel works with multiple clients', async () => {
        renderInCtxProvider(
            ablyClient,
            <AblyProvider
                client={otherClient as unknown as Types.RealtimePromise}
                id="otherClient"
            >
                <UseChannelComponentMultipleClients />
            </AblyProvider>
        );

        await act(async () => {
            ablyClient.channels.get('blah').publish({ text: 'message text1' });
            otherClient.channels.get('bleh').publish({ text: 'message text2' });
        });

        const messageUl = screen.getAllByRole('messages')[0];
        expect(messageUl.children[0].innerHTML).toBe('message text1');
        expect(messageUl.children[1].innerHTML).toBe('message text2');
    });

    it('handles channel errors', async () => {
        const onChannelError = vi.fn();
        const reason = { message: 'foo' };

        renderInCtxProvider(
            ablyClient,
            <UseChannelStateErrorsComponent
                onChannelError={onChannelError}
            ></UseChannelStateErrorsComponent>
        );

        const channelErrorElem = screen.getByRole('channelError');
        expect(onChannelError).toHaveBeenCalledTimes(0);
        expect(channelErrorElem.innerHTML).toEqual('');

        await act(async () => {
            ablyClient.channels.get('blah').emit('failed', {
                reason,
            });
        });

        expect(channelErrorElem.innerHTML).toEqual(reason.message);
        expect(onChannelError).toHaveBeenCalledTimes(1);
        expect(onChannelError).toHaveBeenCalledWith(reason);
    });

    it('handles connection errors', async () => {
        const onConnectionError = vi.fn();
        const reason = { message: 'foo' };

        renderInCtxProvider(
            ablyClient,
            <UseChannelStateErrorsComponent
                onConnectionError={onConnectionError}
            ></UseChannelStateErrorsComponent>
        );

        const connectionErrorElem = screen.getByRole('connectionError');
        expect(onConnectionError).toHaveBeenCalledTimes(0);
        expect(connectionErrorElem.innerHTML).toEqual('');

        await act(async () => {
            ablyClient.connection.emit('failed', {
                reason,
            });
        });

        expect(connectionErrorElem.innerHTML).toEqual(reason.message);
        expect(onConnectionError).toHaveBeenCalledTimes(1);
        expect(onConnectionError).toHaveBeenCalledWith(reason);
    });

    it('should use latest version of message callback', async () => {});

    it('should re-subscribe if event name has changed', async () => {});
});

const UseChannelComponentMultipleClients = () => {
    const [messages, updateMessages] = useState<Types.Message[]>([]);
    useChannel({ channelName: 'blah' }, (message) => {
        updateMessages((prev) => [...prev, message]);
    });
    useChannel({ channelName: 'bleh', id: 'otherClient' }, (message) => {
        updateMessages((prev) => [...prev, message]);
    });

    const messagePreviews = messages.map((msg, index) => (
        <li key={index}>{msg.data.text}</li>
    ));

    return <ul role="messages">{messagePreviews}</ul>;
};

const UseChannelComponent = () => {
    const [messages, updateMessages] = useState<Types.Message[]>([]);
    useChannel('blah', (message) => {
        updateMessages((prev) => [...prev, message]);
    });

    const messagePreviews = messages.map((msg, index) => (
        <li key={index}>{msg.data.text}</li>
    ));

    return <ul role="messages">{messagePreviews}</ul>;
};

interface UseChannelStateErrorsComponentProps {
    onConnectionError?: (err: Types.ErrorInfo) => unknown;
    onChannelError?: (err: Types.ErrorInfo) => unknown;
}

const UseChannelStateErrorsComponent = ({
    onConnectionError,
    onChannelError,
}: UseChannelStateErrorsComponentProps) => {
    const { connectionError, channelError } = useChannel(
        { channelName: 'blah', onConnectionError, onChannelError },
        () => {}
    );

    return (
        <>
            <p role="connectionError">{connectionError?.message}</p>
            <p role="channelError">{channelError?.message}</p>
        </>
    );
};
