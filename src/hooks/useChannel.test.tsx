import React from 'react';
import { it, beforeEach, describe, expect } from 'vitest';
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
                <UseChannelComponentMultipleClients
                    client1={ablyClient}
                    client2={otherClient}
                ></UseChannelComponentMultipleClients>
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
});

const UseChannelComponentMultipleClients = ({ client1, client2 }) => {
    const [messages, updateMessages] = useState<Types.Message[]>([]);
    const { channel: channel1 } = useChannel(
        { channelName: 'blah' },
        (message) => {
            updateMessages((prev) => [...prev, message]);
        }
    );
    const { channel: channel2 } = useChannel(
        { channelName: 'bleh', id: 'otherClient' },
        (message) => {
            updateMessages((prev) => [...prev, message]);
        }
    );

    const messagePreviews = messages.map((msg, index) => (
        <li key={index}>{msg.data.text}</li>
    ));

    return <ul role="messages">{messagePreviews}</ul>;
};

const UseChannelComponent = () => {
    const [messages, updateMessages] = useState<Types.Message[]>([]);
    const { channel, ably } = useChannel('blah', (message) => {
        updateMessages((prev) => [...prev, message]);
    });

    const messagePreviews = messages.map((msg, index) => (
        <li key={index}>{msg.data.text}</li>
    ));

    return <ul role="messages">{messagePreviews}</ul>;
};
