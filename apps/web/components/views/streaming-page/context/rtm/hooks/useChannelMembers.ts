import useSWR from "swr"
import { RtmChannel } from "agora-rtm-sdk"
import { useRTMChannelEvent } from "./useRTMChannelEvent"
import { errorLogAndNotify } from "util/CommonUtil"
import { STREAM_IDENTIFIERS } from "constants/streaming"
import { useMemo } from "react"

// fetcher function that calls the `getMembers` method on the channel
const fetchChannelMembers = async (channel: RtmChannel) => {
   if (!channel) return []

   return channel.getMembers()
}

/**
 * Sorts channel members based on their roles and names in a more streamlined manner.
 * The order of precedence is as follows:
 * 1. Creators are listed first.
 * 2. Screen shares are listed next.
 * 3. Users are listed after screen shares.
 * 4. Unknown roles are listed last.
 * 5. Within each role, members are sorted alphabetically.
 */
const sortMembers = (a: string, b: string) => {
   const precedence = [
      STREAM_IDENTIFIERS.CREATOR,
      STREAM_IDENTIFIERS.SCREEN_SHARE,
      STREAM_IDENTIFIERS.USER,
      STREAM_IDENTIFIERS.ANONYMOUS,
      STREAM_IDENTIFIERS.RECORDING,
   ]

   const getPrecedenceIndex = (identifier: string) => {
      const index = precedence.findIndex((role) => identifier.startsWith(role))
      return index === -1 ? precedence.length : index // Place unknown roles at the end
   }

   const aPrecedence = getPrecedenceIndex(a)
   const bPrecedence = getPrecedenceIndex(b)

   if (aPrecedence !== bPrecedence) {
      return aPrecedence - bPrecedence
   }

   return a.localeCompare(b)
}

/**
 * Custom hook to manage channel members in real-time.
 * It utilizes SWR for data fetching and caching, and listens to RTM channel events
 * to update the members list upon member join or leave events.
 *
 * @param {RtmChannel} channel - The RTM channel instance.
 */
export const useChannelMembers = (channel: RtmChannel) => {
   const channelId = channel?.channelId

   const { data, error, mutate, isLoading } = useSWR<string[]>(
      channelId ? ["channelMembers", channelId] : null,
      () => fetchChannelMembers(channel),
      {
         revalidateOnFocus: false,
         onError: (error, key) => {
            errorLogAndNotify(error, {
               message: "Failed to fetch channel members",
               metadata: {
                  channelId,
                  key,
               },
            })
         },
      }
   )

   /**
    * Utilizes the `useRTMChannelEvent` hook to listen for the "MemberJoined" event
    * and triggers a mutation in the SWR cache to include the new member.
    */
   useRTMChannelEvent(channel, "MemberJoined", (newMemberId: string) => {
      return mutate(
         async (currentMembers) => {
            const newSet = new Set(currentMembers || [])
            newSet.add(newMemberId)
            return Array.from(newSet)
         },
         {
            populateCache: true,
            revalidate: false,
         }
      )
   })

   /**
    * Listens for the "MemberLeft" event and updates the SWR cache by removing the member who left.
    * It does not trigger a revalidation of the data, ensuring the cache is populated with the latest state.
    */
   useRTMChannelEvent(channel, "MemberLeft", (memberId: string) => {
      return mutate(
         (currentMembers) =>
            currentMembers?.filter((member) => member !== memberId),
         {
            revalidate: false,
            populateCache: true,
         }
      )
   })

   const sortedMembers = useMemo(() => data?.sort(sortMembers), [data])

   return {
      members: sortedMembers,
      isLoading,
      error,
   }
}
