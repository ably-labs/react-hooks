import { it, beforeEach, describe, expect } from 'vitest';
import { provideSdkInstance } from "../AblyReactHooks";
import { usePresence } from "./usePresence";
import { render, screen, act } from '@testing-library/react';
import { FakeAblySdk, FakeAblyChannels } from "../fakes/ably";

const testChannelName = "testChannel";

describe("usePresence", () => {
    let channels: FakeAblyChannels;
    let ablyClient: FakeAblySdk;
    let otherClient: FakeAblySdk;

    beforeEach(() => {
        channels = new FakeAblyChannels([testChannelName]);
        ablyClient = new FakeAblySdk().connectTo(channels);
        otherClient = new FakeAblySdk().connectTo(channels);
        provideSdkInstance(ablyClient as any);
    });

    it("presence data is not visible on first render as it runs in an effect", async () => {
        render(<UsePresenceComponent></UsePresenceComponent>);        
        
        const values = screen.getByRole("presence").innerHTML;
        expect(values).toBe("");        
        
        await act(async () => {
            await wait(2); 
            // To let react run its updates so we don't see warnings in the test output
        });
    });

    it("presence data available after effect runs", async () => {
        render(<UsePresenceComponent></UsePresenceComponent>);
        
        await act(async () => {
            await wait(2);
        });

        const values = screen.getByRole("presence").innerHTML;
        expect(values).toContain(`"bar"`);
    });

    it("presence data updates when update function is triggered", async () => {
        render(<UsePresenceComponent></UsePresenceComponent>);

        await act(async () => {
            const button = screen.getByText(/Update/i);
            button.click();
        });

        const values = screen.getByRole("presence").innerHTML;
        expect(values).toContain(`"baz"`);
    });

    it("presence data respects updates made by other clients", async () => {
        render(<UsePresenceComponent></UsePresenceComponent>);

        await act(async () => {
            otherClient.channels.get(testChannelName).presence.enter("boop");
        });

        const presenceElement = screen.getByRole("presence");
        const values = presenceElement.innerHTML;
        expect(presenceElement.children.length).toBe(2);
        expect(values).toContain(`"bar"`);
        expect(values).toContain(`"boop"`);
    });

    it("presence API works with type information provided", async () => {
        render(<TypedUsePresenceComponent></TypedUsePresenceComponent>);
        
        await act(async () => {
            await wait(2);
        });

        const values = screen.getByRole("presence").innerHTML;
        expect(values).toContain(`"data":{"foo":"bar"}`);
    });

    it("usePresence works with multiple clients", async () => {
        render(<UsePresenceComponentMultipleClients client1={ablyClient} client2={otherClient}></UsePresenceComponentMultipleClients>);
        
        await act(async () => {
            const button = screen.getByText(/Update/i);
            button.click();
            await wait(2);
        });

        const values = screen.getByRole("presence").innerHTML;
        expect(values).toContain(`"data":"baz1"`);
        expect(values).toContain(`"data":"baz2"`);
    });
});

const UsePresenceComponent = () => {
    const [val, update] = usePresence(testChannelName, "bar");
    
    const presentUsers = val.map((presence, index) => {
        return (<li key={index}>{presence.clientId} - {JSON.stringify(presence)}</li>)
    });

    return (
        <>
            <button onClick={() => { 
                update("baz"); 
            }}>
                Update
            </button>
            <ul role='presence'>
                {presentUsers}
            </ul>
        </>
    );
}

const UsePresenceComponentMultipleClients = ({client1, client2}) => {
    const [val1, update1] = usePresence({channelName: testChannelName, realtime: client1}, "foo");
    const [val2, update2] = usePresence({channelName: testChannelName, realtime: client2}, "bar");
    
    const presentUsers = val1.map((presence, index) => {
        return (<li key={index}>{presence.clientId} - {JSON.stringify(presence)}</li>)
    });

    return (
        <>
            <button onClick={() => { 
                update1("baz1"); 
                update2("baz2"); 
            }}>
                Update
            </button>
            <ul role='presence'>
                {presentUsers}
            </ul>
        </>
    );
}

interface MyPresenceType {
    foo: string;
}

const TypedUsePresenceComponent = () => {
    const [val] = usePresence<MyPresenceType>("testChannelName", { foo: "bar" });

    return (
        <div role='presence'>
            {JSON.stringify(val)}
        </div>
    );
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
