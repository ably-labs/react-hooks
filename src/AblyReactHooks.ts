import Ably from "ably/promises";
import { Types } from "ably";

let ably = null;

export function configureAbly(ablyConfigurationObject: string | Types.ClientOptions) {
    return ably || (ably = new Ably.Realtime.Promise(ablyConfigurationObject));
}

export function assertConfiguration(): Types.RealtimePromise {
    if (!ably) {
        throw new Error('Ably not configured - please call configureAbly({ key: "your-api-key", clientId: "someid" });');
    }

    return ably;
}
