import { RtmChannel, RtmEvents, RtmMessage } from "agora-rtm-sdk"
import useRTMEvent from "./useRTMEvent"
import { Fn, Nullable } from "./util"

export type RTMChannelEventName = keyof RtmEvents.RtmChannelEvents & string

/**
 * This event is triggered when the channel member count changes, providing the updated count.
 *
 * Note:
 * - If member count is 512 or less, this event is triggered once per second when the count changes.
 * - If member count exceeds 512, this event is triggered once every three seconds when the count changes.
 * - This event is also received upon successfully joining an RTM channel, which helps in getting timely updates on the member count.
 *
 * @event
 * @param memberCount The new member count of the channel.
 */
export function useRTMChannelEvent(
   track: Nullable<RtmChannel>,
   event: "MemberCountUpdated",
   listener: Nullable<(newCount: number) => void>
): void

/**
 * Occurs when the local user receives a channel message.
 * @event
 * @param message The received channel message object.
 * @param memberId The uid of the sender.
 */
export function useRTMChannelEvent(
   track: Nullable<RtmChannel>,
   event: "ChannelMessage",
   listener: Nullable<(message: RtmMessage, memberId: string) => void>
): void

export function useRTMChannelEvent(
   channel: Nullable<RtmChannel>,
   event: RTMChannelEventName,
   listener: Nullable<Fn>
) {
   useRTMEvent(channel, event, listener)
}
