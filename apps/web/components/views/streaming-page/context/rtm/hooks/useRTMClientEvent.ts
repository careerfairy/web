import { RtmClient, RtmStatusCode, RtmEvents } from "agora-rtm-sdk"
import { Fn, Nullable, listen } from "./util"
import { useEffect, useRef } from "react"
import { useIsomorphicLayoutEffect } from "react-use"

export type RTMClientEventName = keyof RtmEvents.RtmClientEvents & string

/**
 * @event ConnectionStateChanged
 * @description Emitted when SDK's connection state with Agora RTM system changes.
 * @param newState - The new connection state.
 * @param reason - The reason for the connection state change.
 */
export function useRTMClientEvent(
   track: Nullable<RtmClient>,
   event: "ConnectionStateChanged",
   listener: Nullable<
      (
         newState: RtmStatusCode.ConnectionState,
         reason: RtmStatusCode.ConnectionChangeReason
      ) => void
   >
): void

/**
 * Triggered when the SDK is reconnecting and the RTM token used has surpassed its 24-hour issuance validity period.
 *
 * - This callback is only triggered if the SDK is in the `RECONNECTING` state due to the RTM backend detecting the token's expiration. It will not trigger in the `CONNECTED` state.
 * - Upon receiving this callback, promptly generate a new RTM Token on your server side and use the {@link renewToken} method to update the token with the server.
 */
export function useRTMClientEvent(
   track: Nullable<RtmClient>,
   event: "TokenExpired",
   listener: Nullable<() => void>
): void

export function useRTMClientEvent(
   client: Nullable<RtmClient>,
   event: RTMClientEventName,
   listener: Nullable<Fn>
) {
   const listenerRef = useRef<Nullable<Fn>>(listener)

   useIsomorphicLayoutEffect(() => {
      listenerRef.current = listener
   }, [listener])

   useEffect(() => {
      if (client) {
         const disposer = listen(client, event, (...args: unknown[]) => {
            listenerRef.current?.(...args)
         })
         return disposer
      }
   }, [event, client])
}
