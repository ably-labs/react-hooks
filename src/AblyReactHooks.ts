import Ably from "ably";
import { Types } from "ably";

let sdkInstance = null;

export function provideSdkInstance(ablyInstance: Types.RealtimePromise) {
    sdkInstance = ablyInstance;
}

export function configureAbly(ablyConfigurationObject: string | Types.ClientOptions) {
  return sdkInstance || (sdkInstance = new Ably.Realtime.Promise(ablyConfigurationObject));
}

export function assertConfiguration(): Types.RealtimePromise {
  if (!sdkInstance) {
    throw new Error('Ably not configured - please call configureAbly({ key: "your-api-key", clientId: "someid" });');
  }

  return sdkInstance;
}
