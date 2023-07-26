import React from 'react';
import { provideSdkInstance } from '../AblyReactHooks';
import { useChannel } from './useChannel';
import { useState } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { Types } from 'ably';
import { TestApp } from '../test/testapp';

describe('useChannel', () => {
    let testApp: TestApp;

    beforeAll(async () => {
        testApp = await TestApp.create();
    });

    afterAll(async () => {
        await testApp.delete();
    }, 10_000);

    it('component can useChannel and renders nothing by default', async () => {
        const client = await testApp.client();
        provideSdkInstance(client);
        render(<UseChannelComponent></UseChannelComponent>);
        const messageUl = screen.getAllByRole('messages')[0];

        expect(messageUl.childElementCount).toBe(0);
        client.close();
    });

    it('component updates when message arrives', async () => {
        const client = await testApp.client();
        const otherClient = await testApp.client();
        provideSdkInstance(client);
        render(<UseChannelComponent></UseChannelComponent>);

        await act(async () => {
            await otherClient.channels
                .get('blah')
                .publish('event', { text: 'message text' });
        });

        const messageUl = screen.getAllByRole('messages')[0];

        await waitFor(() => {
            expect(messageUl.childElementCount).toBe(1);
            expect(messageUl.children[0].innerHTML).toBe('message text');
        });
        client.close();
        otherClient.close();
    });

    it('component updates when multiple messages arrive', async () => {
        const client = await testApp.client();
        const otherClient = await testApp.client();
        provideSdkInstance(client);
        render(<UseChannelComponent></UseChannelComponent>);

        await act(async () => {
            await otherClient.channels
                .get('blah')
                .publish('event', { text: 'message text1' });
            await otherClient.channels
                .get('blah')
                .publish('event', { text: 'message text2' });
        });

        const messageUl = screen.getAllByRole('messages')[0];

        await waitFor(() => {
            expect(messageUl.children[0].innerHTML).toBe('message text1');
            expect(messageUl.children[1].innerHTML).toBe('message text2');
        });
        client.close();
        otherClient.close();
    });

    it('useChannel works with multiple clients', async () => {
        const client = await testApp.client();
        const otherClient = await testApp.client();
        provideSdkInstance(client);
        render(
            <UseChannelComponentMultipleClients
                client1={client}
                client2={otherClient}
            ></UseChannelComponentMultipleClients>
        );

        await act(async () => {
            await client.channels
                .get('blah')
                .publish('event', { text: 'message text1' });
            await otherClient.channels
                .get('bleh')
                .publish('event', { text: 'message text2' });
        });

        const messageUl = screen.getAllByRole('messages')[0];

        await waitFor(() => {
            expect(messageUl.children[0].innerHTML).toBe('message text1');
            expect(messageUl.children[1].innerHTML).toBe('message text2');
        });
        client.close();
        otherClient.close();
    });
});

const UseChannelComponentMultipleClients = ({ client1, client2 }) => {
    const [messages, updateMessages] = useState<Types.Message[]>([]);
    const [channel1] = useChannel(
        { channelName: 'blah', realtime: client1 },
        (message) => {
            updateMessages((prev) => [...prev, message]);
        }
    );
    const [channel2] = useChannel(
        { channelName: 'bleh', realtime: client2 },
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
    const [channel, ably] = useChannel('blah', (message) => {
        updateMessages((prev) => [...prev, message]);
    });

    const messagePreviews = messages.map((msg, index) => (
        <li key={index}>{msg.data.text}</li>
    ));

    return <ul role="messages">{messagePreviews}</ul>;
};
