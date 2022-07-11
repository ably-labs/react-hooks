import { it, beforeEach, describe, expect } from 'vitest';
import { provideSdkInstance } from "../AblyReactHooks";
import { useChannel } from "./useChannel";
import { useState } from "react";
import { render, screen } from '@testing-library/react';
import { FakeAblySdk, FakeAblyChannels } from "../fakes/ably";
import { Types } from 'ably';
import { act } from 'react-dom/test-utils';

describe("useChannel", () => {
    let channels: FakeAblyChannels;
    let ablyClient: FakeAblySdk;
    let otherClient: FakeAblySdk;

    beforeEach(() => {
        channels = new FakeAblyChannels(["blah"]);
        ablyClient = new FakeAblySdk().connectTo(channels);
        otherClient = new FakeAblySdk().connectTo(channels);
        provideSdkInstance(ablyClient as any);
    });

    it("component can useChannel and renders nothing by default", async () => {
        render(<UseChannelComponent></UseChannelComponent>);
        const messageUl = screen.getAllByRole("messages")[0];

        expect(messageUl.childElementCount).toBe(0);
    });

    it("component updates when message arrives", async () => {
        render(<UseChannelComponent></UseChannelComponent>);

        await act(async () => {
            otherClient.channels.get("blah").publish({ text: "message text" });
        });

        const messageUl = screen.getAllByRole("messages")[0];     
        expect(messageUl.childElementCount).toBe(1);
        expect(messageUl.children[0].innerHTML).toBe("message text");
    });

    it("component updates when multiple messages arrive", async () => {
        render(<UseChannelComponent></UseChannelComponent>);

        await act(async () => {
            otherClient.channels.get("blah").publish({ text: "message text1" });
            otherClient.channels.get("blah").publish({ text: "message text2" });
        });

        const messageUl = screen.getAllByRole("messages")[0];
        expect(messageUl.children[0].innerHTML).toBe("message text1");
        expect(messageUl.children[1].innerHTML).toBe("message text2");
    });
});

const UseChannelComponent = () => {
    const [messages, updateMessages] = useState<Types.Message[]>([]);
    const [channel, ably] = useChannel("blah", (message) => {
        updateMessages((prev) => [...prev, message]);
    });
    
    const messagePreviews = messages.map((msg, index) => <li key={index}>{msg.data.text}</li>);
    
    return (<ul role="messages">{messagePreviews}</ul>);
}
