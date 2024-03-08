import type { RtmChannel, RtmClient } from "agora-rtm-sdk"
import { Context, ReactNode, createContext, useContext } from "react"

type AgoraRTMClientProviderProps = {
   client: RtmClient
   children: ReactNode
}

type AgoraRTMChannelProviderProps = {
   channel: RtmChannel
   children: ReactNode
}

const AgoraRTMClientContext = createContext<RtmClient | null>(null)

const AgoraRTMChannelContext = createContext<RtmChannel | null>(null)

export const AgoraRTMClientProvider = ({
   client,
   children,
}: AgoraRTMClientProviderProps) => {
   return (
      <AgoraRTMClientContext.Provider value={client}>
         {children}
      </AgoraRTMClientContext.Provider>
   )
}

export const AgoraRTMChannelProvider = ({
   channel,
   children,
}: AgoraRTMChannelProviderProps) => {
   return (
      <AgoraRTMChannelContext.Provider value={channel}>
         {children}
      </AgoraRTMChannelContext.Provider>
   )
}

/**
 * Generic hook to optionally use a context value or a provided value.
 *
 * @param context - The React context to use if no value is provided.
 * @param value - An optional value. If provided, this value is used instead of the context value.
 * @returns The resolved value from either the provided value or the context.
 */
function useOptionalContext<T>(
   context: Context<T | null>,
   value?: T | null
): T | null {
   const valueFromContext = useContext(context)
   return value || valueFromContext
}

/**
 * Returns the IAgoraRTMClient object.
 *
 * @param client - If provided, the passed `IAgoraRTMClient` object is returned. If not provided, the `IAgoraRTMClient` object obtained from the [parent component's context](https://api-ref.agora.io/en/rtm-sdk/reactjs/2.x/functions/AgoraRTMProvider.html) is returned.
 * @example
 * ```jsx
 * import { useRTMClient } from "agora-rtc-react";
 *
 * function App() {
 *   const client = useRTMClient();
 *
 *   return <></>;
 * }
 * ```
 */
export const useRTMClient = (client?: RtmClient | null): RtmClient => {
   const resolvedClient = useOptionalContext(AgoraRTMClientContext, client)

   if (!resolvedClient) {
      throw new Error(
         "Agora RTM client not found. Should be wrapped in <AgoraRTMClientProvider value={client} />"
      )
   }

   return resolvedClient
}

/**
 * Custom hook to obtain an RTM channel instance.
 *
 * This hook attempts to resolve an RTM channel instance from the provided argument.
 * If no channel is provided, it attempts to resolve the channel from the context.
 * If no channel can be resolved, it throws an error.
 *
 * @param {RtmChannel | null} channel - The RTM channel instance to use. If not provided, the channel is obtained from the context.
 * @returns {RtmChannel} The resolved RTM channel instance.
 * @throws {Error} If no RTM channel instance can be resolved.
 */
export const useRTMChannel = (channel?: RtmChannel | null): RtmChannel => {
   const resolvedChannel = useOptionalContext(AgoraRTMChannelContext, channel)

   if (!resolvedChannel) {
      throw new Error(
         "Agora RTM channel not found. Should be wrapped in <AgoraRTMChannelProvider value={channel} />"
      )
   }

   return resolvedChannel
}
