import { LivestreamChatEntry } from "@careerfairy/shared-lib/livestreams"
import { IconButton, Stack, Typography } from "@mui/material"
import { forwardRef, memo, useEffect, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { getChatAuthor, getIsMe } from "./util"
import DateUtil from "util/DateUtil"
import LinkifyText from "components/util/LinkifyText"
import { MoreVertical } from "react-feather"
import { useStreamingContext } from "../../context"
import { useAuth } from "HOCs/AuthProvider"
import { UserType } from "../../util"
import { UserDetails } from "../UserDetails"

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
})

type Props = {
   entry: LivestreamChatEntry
   onOptionsClick: (event: React.MouseEvent<HTMLElement>) => void
}

/**
 * Prevents unnecessary re-renders by comparing document ids in props.
 * @param prevProps Previous component props.
 * @param nextProps Next component props.
 * @returns True if the props are equal, false otherwise.
 */
const propsAreEqual = (prevProps: Props, nextProps: Props) =>
   prevProps.entry.id === nextProps.entry.id

export const ChatEntry = memo(
   forwardRef<HTMLDivElement, Props>(({ entry, onOptionsClick }, ref) => {
      const userType = getChatAuthor(entry)
      const timeSinceEntry = useTimeSinceEntry(entry)
      const { authenticatedUser, userData } = useAuth()
      const { isHost, agoraUserId } = useStreamingContext()

      const isMe = getIsMe(
         entry,
         agoraUserId,
         authenticatedUser.email,
         authenticatedUser.uid
      )

      const showOptions = Boolean(isMe || isHost || userData?.isAdmin)

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
            <Typography color="neutral.200" variant="xsmall">
               {timeSinceEntry}
            </Typography>
         </Stack>
      )
   }),
   propsAreEqual
)

const useTimeSinceEntry = (entry: LivestreamChatEntry) => {
   const [timeSince, setTimeSince] = useState(() =>
      DateUtil.getTimeAgo(entry.timestamp.toDate())
   )

   useEffect(() => {
      // Function to periodically refresh the "time since" string
      const refreshTimeSince = () => {
         setTimeSince(DateUtil.getTimeAgo(entry.timestamp.toDate()))
      }

      // Refresh the "time since" every 30 seconds
      const interval = setInterval(refreshTimeSince, 30000)

      // Clear the interval when the component unmounts
      return () => clearInterval(interval)
   }, [entry.timestamp])

   return timeSince
}

ChatEntry.displayName = "ChatEntry"
