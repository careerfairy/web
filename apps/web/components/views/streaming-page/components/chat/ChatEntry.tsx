import { LivestreamChatEntry } from "@careerfairy/shared-lib/livestreams"
import { Box, IconButton, Stack, Typography } from "@mui/material"
import LinkifyText from "components/util/LinkifyText"
import { useAuth } from "HOCs/AuthProvider"
import { forwardRef, memo, useEffect, useState } from "react"
import { MoreVertical } from "react-feather"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { useStreamingContext } from "../../context"
import { UserType } from "../../util"
import { UserDetails } from "../UserDetails"
import { getChatAuthor, getIsMe } from "./util"
import { useToggleChatReaction } from "components/custom-hook/streaming/useToggleChatReaction"

const styles = sxStyles({
   root: {
      position: "relative",
      px: 2,
      py: 1.5,
   },
   background: {
      [UserType.Streamer]: {
         bgcolor: "#FAF9FF",
      },
      [UserType.CareerFairy]: {
         bgcolor: "#F9FFFE",
      },
      [UserType.Viewer]: {
         bgcolor: "none",
      },
   },
   text: {
      wordBreak: "break-word",
      whiteSpace: "pre-line",
      lineHeight: "142.857%",
   },
   optionsIcon: {
      "& svg": {
         width: 21,
         height: 21,
         color: (theme) => theme.brand.black[600],
      },
   },
   reactionContainer: {
      display: "flex",
      alignItems: "center",
   },
   reactionIcon: {
      width: 24,
      height: 24,
      cursor: "pointer",
      opacity: 0.6,
      transition: "opacity 0.2s",
      "&:hover": {
         opacity: 1,
      },
   },
   reactionCount: {
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      height: 24,
      px: 1.5,
      py: 0.5,
      borderRadius: "60px",
      backgroundColor: (theme) => theme.brand.white[500],
   },
})

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
const propsAreEqual = (prevProps: Props, nextProps: Props) =>
   prevProps.entry.id === nextProps.entry.id &&
   prevProps.entry.thumbsUp?.length === nextProps.entry.thumbsUp?.length

export const ChatEntry = memo(
   forwardRef<HTMLDivElement, Props>(({ entry, onOptionsClick }, ref) => {
      const userType = getChatAuthor(entry)
      const timeSinceEntry = useTimeSinceEntry(entry)
      const { authenticatedUser, userData } = useAuth()
      const { isHost, agoraUserId, livestreamId } = useStreamingContext()

      const isMe = getIsMe(
         entry,
         agoraUserId,
         authenticatedUser.email,
         authenticatedUser.uid
      )

      const showOptions = Boolean(isMe || isHost || userData?.isAdmin)

      const { addReaction, removeReaction } = useToggleChatReaction(
         livestreamId,
         authenticatedUser.uid
      )

      const thumbsUpCount = entry.thumbsUp?.length || 0
      const hasUserReacted = authenticatedUser.uid 
         ? entry.thumbsUp?.includes(authenticatedUser.uid)
         : false

      const handleReactionClick = async () => {
         if (!authenticatedUser.uid) {
            console.warn("User must be authenticated to react to messages")
            return
         }

         try {
            if (hasUserReacted) {
               await removeReaction(entry.id, "thumbsUp")
            } else {
               await addReaction(entry.id, "thumbsUp")
            }
         } catch (error) {
            console.error("Failed to toggle reaction:", error)
         }
      }

      return (
         <Stack
            spacing={1}
            ref={ref}
            sx={[styles.root, styles.background[userType]]}
         >
            <Stack direction="row" justifyContent="space-between">
               <UserDetails
                  userType={userType}
                  displayName={entry.authorName}
               />
               {Boolean(showOptions) && (
                  <IconButton
                     sx={styles.optionsIcon}
                     onClick={onOptionsClick}
                     size="small"
                  >
                     <MoreVertical />
                  </IconButton>
               )}
            </Stack>
            <Typography
               color="neutral.800"
               variant="small"
               component="p"
               sx={styles.text}
            >
               <LinkifyText>{entry.message}</LinkifyText>
            </Typography>
            <Stack direction="row" sx={styles.reactionContainer}>
               <Typography color="neutral.200" variant="xsmall">
                  {timeSinceEntry}
               </Typography>
               <Stack direction="row" alignItems="center" ml="auto" gap={1}>
                  {thumbsUpCount > 0 && (
                     <Box sx={styles.reactionCount}>
                        <Typography variant="xsmall">👍</Typography>
                        <Typography variant="xsmall" color="neutral.800">
                           {thumbsUpCount}
                        </Typography>
                     </Box>
                  )}
                  <Box
                     component="img"
                     src="https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/Chat-reaction-icon.svg?alt=media&token=6dc8149c-ee79-4fc7-88e5-44e24899b07c"
                     alt="React to message"
                     sx={styles.reactionIcon}
                     onClick={handleReactionClick}
                  />
               </Stack>
            </Stack>
         </Stack>
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
