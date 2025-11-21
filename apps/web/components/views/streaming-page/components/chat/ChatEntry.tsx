import { LivestreamChatEntry } from "@careerfairy/shared-lib/livestreams"
import { useToggleChatReaction } from "components/custom-hook/streaming/useToggleChatReaction"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { useAuth } from "HOCs/AuthProvider"
import { forwardRef, memo, useEffect, useMemo, useState } from "react"
import DateUtil from "util/DateUtil"
import { useStreamingContext } from "../../context"
import {
   ChatCard,
   ChatCardReactions,
   createChatCardReactions,
} from "./ChatCard"
import { getIsMe, REACTION_EMOJIS, ReactionType } from "./util"

const REACTION_TYPES = Object.keys(REACTION_EMOJIS) as ReactionType[]

type Props = {
   entry: LivestreamChatEntry
   onOptionsClick: (event: React.MouseEvent<HTMLElement>) => void
}

/**
 * Prevents unnecessary re-renders by comparing document ids and reactions in props.
 * @param prevProps Previous component props.
 * @param nextProps Next component props.
 * @returns True if the props are equal, false otherwise.
 */
const propsAreEqual = (prevProps: Props, nextProps: Props) => {
   // Always re-render if the entry ID changes
   if (prevProps.entry.id !== nextProps.entry.id) {
      return false
   }

   // Compare reaction arrays by sorting and stringifying (since they're just user ID strings)

   for (const reactionType of REACTION_TYPES) {
      const prevReactions = (prevProps.entry[reactionType] || [])
         .sort()
         .join(",")
      const nextReactions = (nextProps.entry[reactionType] || [])
         .sort()
         .join(",")

      if (prevReactions !== nextReactions) {
         return false
      }
   }

   return true
}

export const ChatEntry = memo(
   forwardRef<HTMLDivElement, Props>(({ entry, onOptionsClick }, ref) => {
      const timeSinceEntry = useTimeSinceEntry(entry)
      const { authenticatedUser, userData } = useAuth()
      const { isHost, agoraUserId, livestreamId } = useStreamingContext()
      const { errorNotification } = useSnackbarNotifications()

      const isMe = getIsMe(
         entry,
         agoraUserId,
         authenticatedUser.email,
         authenticatedUser.uid
      )

      const showOptions = Boolean(isMe || isHost || userData?.isAdmin)

      // Use agoraUserId as the unique identifier for reactions to support multiple speakers
      const userId = agoraUserId || authenticatedUser.uid

      const { addReaction, removeReaction } = useToggleChatReaction(
         livestreamId,
         userId
      )

      // Get reaction counts and check if user reacted for each type
      const reactions = useMemo(
         () => createChatCardReactions(entry, userId),
         [entry, userId]
      )

      // Find which reaction the current user has selected (if any)
      const userSelectedReaction = (
         Object.entries(reactions) as [
            ReactionType,
            ChatCardReactions["thumbsUp"]
         ][]
      ).find(([_, r]) => r.hasUserReacted)?.[0]

      const handleReactionClick = async (reactionType: ReactionType) => {
         if (!userId) {
            errorNotification("User must be authenticated to react to messages")
            return
         }

         try {
            const reaction = reactions[reactionType]

            // If clicking the same reaction, remove it
            if (reaction.hasUserReacted) {
               await removeReaction(entry.id, reactionType)
            } else {
               // Remove any existing reaction first (one reaction per user)
               if (userSelectedReaction) {
                  await removeReaction(entry.id, userSelectedReaction)
               }
               // Add the new reaction
               await addReaction(entry.id, reactionType)
            }
         } catch (error) {
            errorNotification("Failed to toggle reaction:", error)
         }
      }

      return (
         <ChatCard
            ref={ref}
            entry={entry}
            timestamp={timeSinceEntry}
            reactions={reactions}
            userSelectedReaction={userSelectedReaction}
            showOptions={showOptions}
            onOptionsClick={onOptionsClick}
            onReactionClick={handleReactionClick}
         />
      )
   }),
   propsAreEqual
)

const useTimeSinceEntry = (entry: LivestreamChatEntry) => {
   const [timeSince, setTimeSince] = useState(() =>
      DateUtil.getTimeAgo(entry.timestamp?.toDate() ?? new Date())
   )

   useEffect(() => {
      // Function to periodically refresh the "time since" string
      const refreshTimeSince = () => {
         setTimeSince(
            DateUtil.getTimeAgo(entry.timestamp?.toDate() ?? new Date())
         )
      }

      // Refresh the "time since" every 30 seconds
      const interval = setInterval(refreshTimeSince, 30000)

      // Clear the interval when the component unmounts
      return () => clearInterval(interval)
   }, [entry.timestamp])

   return timeSince
}

ChatEntry.displayName = "ChatEntry"
