import * as Ably from 'ably';
import { Types } from 'ably';
import got from 'got';

export class TestApp {
    id: string;
    key: string;

    static async create() {
        const url = 'https://sandbox-rest.ably.io/apps';
        const body = { keys: [{}] };

        const res: {
            appId: string;
            keys: { keyStr: string }[];
        } = await got.post(url, { json: body }).json();

        return new TestApp(res.appId, res.keys[0].keyStr);
    }

    constructor(id: string, key: string) {
        this.id = id;
        this.key = key;
    }

    client(clientId?: string): Types.RealtimePromise {
        return new Ably.Realtime.Promise({
            key: this.key,
            environment: 'sandbox',
            clientId: clientId || null,
        });
    }

    delete() {
        return got.delete(
            `https://sandbox-rest.ably.io/apps/${this.id}?key=${this.key}`
        );
    }
}
