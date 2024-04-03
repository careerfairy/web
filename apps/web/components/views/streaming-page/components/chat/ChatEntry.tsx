import { LivestreamChatEntry } from "@careerfairy/shared-lib/livestreams"
import { IconButton, Stack, Typography } from "@mui/material"
import { forwardRef, memo, useEffect, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { ChatAuthor, getChatAuthor, getIsMe } from "./util"
import { useCompanyLogoUrl } from "store/selectors/streamingAppSelectors"
import CircularLogo from "components/views/common/logos/CircularLogo"
import ColorizedAvatar from "components/views/common/ColorizedAvatar"
import DateUtil from "util/DateUtil"
import LinkifyText from "components/util/LinkifyText"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { MoreVertical } from "react-feather"
import { useStreamingContext } from "../../context"
import { useAuth } from "HOCs/AuthProvider"

const AVATAR_SIZE = 29

const styles = sxStyles({
   root: {
      position: "relative",
      px: 2,
      py: 1.5,
   },
   details: {
      alignItems: "center",
   },
   avatar: {
      height: AVATAR_SIZE,
      width: AVATAR_SIZE,
      color: "white",
      fontSize: "1rem",
   },
   displayNameColor: {
      [ChatAuthor.Streamer]: {
         color: "secondary.main",
      },
      [ChatAuthor.CareerFairy]: {
         color: "primary.main",
      },
      [ChatAuthor.Viewer]: {
         color: "neutral.800",
      },
   },
   hostTag: {
      fontSize: "0.714rem",
      color: (theme) => theme.brand.black[700],
      fontStyle: "italic",
      fontWeight: 400,
   },
   background: {
      [ChatAuthor.Streamer]: {
         bgcolor: "#FAF9FF",
      },
      [ChatAuthor.CareerFairy]: {
         bgcolor: "#F9FFFE",
      },
      [ChatAuthor.Viewer]: {
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
      const authorType = getChatAuthor(entry)
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
            sx={[styles.root, styles.background[authorType]]}
         >
            <Stack direction="row" justifyContent="space-between">
               <Stack direction="row" spacing={1} sx={styles.details}>
                  <EntryAvatar authorType={authorType} entry={entry} />
                  <Typography
                     color="neutral.800"
                     fontWeight={600}
                     variant="small"
                     sx={[
                        styles.displayNameColor[authorType],
                        getMaxLineStyles(1),
                     ]}
                  >
                     {authorType === ChatAuthor.CareerFairy
                        ? "CareerFairy"
                        : entry.authorName}
                     {authorType === ChatAuthor.Streamer && (
                        <Typography component="span" sx={styles.hostTag}>
                           {" "}
                           (Host)
                        </Typography>
                     )}
                  </Typography>
               </Stack>
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

type EntryAvatarProps = {
   entry: LivestreamChatEntry
   authorType: ChatAuthor
}

const EntryAvatar = ({ entry, authorType }: EntryAvatarProps) => {
   const companyLogoUrl = useCompanyLogoUrl()

   const [firstName, lastName] = entry.authorName.split(" ")

   if (
      authorType === ChatAuthor.Viewer ||
      (authorType === ChatAuthor.Streamer && !companyLogoUrl) // Edge-case: When livestream is missing company logo, we use initials
   ) {
      return (
         <ColorizedAvatar
            sx={styles.avatar}
            firstName={firstName}
            lastName={lastName}
         />
      )
   }

   return (
      <CircularLogo
         src={
            authorType === ChatAuthor.Streamer
               ? companyLogoUrl
               : "/logo-green.png"
         }
         size={AVATAR_SIZE}
         alt={entry.authorName}
      />
   )
}

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
