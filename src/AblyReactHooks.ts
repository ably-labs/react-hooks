import Ably from "ably";
import { Types } from "ably";

export type ChannelNameAndOptions = {
  channelName: string;
  options?: Types.ChannelOptions;
  realtime?: Types.RealtimePromise;
};
export type ChannelParameters = string | ChannelNameAndOptions;

const version = "2.1.0";

let sdkInstance: Realtime | null = null;

export class Realtime extends Ably.Realtime.Promise {
  constructor(options: string | Types.ClientOptions) {
    if (typeof options === "string") {
      options = {
        key: options,
      } as Types.ClientOptions;
    }

    (options as any).agents = { "react-hooks": version };

    super(options);
  }
}

export function provideSdkInstance(ablyInstance: Types.RealtimePromise) {
  sdkInstance = ablyInstance;
}

export function configureAbly(
  ablyConfigurationObject: string | Types.ClientOptions
) {
  return sdkInstance || (sdkInstance = new Realtime(ablyConfigurationObject));
}

export function assertConfiguration(): Types.RealtimePromise {
  if (!sdkInstance) {
    throw new Error(
      'Ably not configured - please call configureAbly({ key: "your-api-key", clientId: "someid" });'
    );
  }

  return sdkInstance;
}
