import {
   LivestreamChatEntry,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   CircularProgress,
   Collapse,
   Stack,
   Typography,
} from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useChatEntries } from "components/custom-hook/streaming/useChatEntries"
import {
   ChatCard,
   createChatCardReactions,
} from "components/views/streaming-page/components/chat/ChatCard"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useInView } from "react-intersection-observer"
import { TransitionGroup } from "react-transition-group"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { useRecordingFormContext } from "../RecordingFormProvider"
import { BaseDetailView } from "./BaseDetailView"

const MIN_CHAT_TO_SHOW = 50

const styles = sxStyles({
   loading: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      p: 2,
   },
})

type ChatViewProps = {
   onBack: () => void
}

export const ChatView = ({ onBack }: ChatViewProps) => {
   return (
      <BaseDetailView title="Chat" onBack={onBack}>
         <SuspenseWithBoundary
            fallback={
               <Box sx={styles.loading}>
                  <CircularProgress />
               </Box>
            }
         >
            <ChatContent />
         </SuspenseWithBoundary>
      </BaseDetailView>
   )
}

const ChatContent = () => {
   const { livestream } = useRecordingFormContext()
   const [chatLimit, setChatLimit] = useState(MIN_CHAT_TO_SHOW)
   const [ref, inView] = useInView()

   const { data: chatEntries } = useChatEntries(livestream?.id || "", {
      limit: chatLimit,
      sortOrder: "asc",
   })

   useEffect(() => {
      if (inView) {
         setChatLimit((prev) => prev + MIN_CHAT_TO_SHOW)
      }
   }, [inView])

   if (!chatEntries || chatEntries.length === 0) {
      return (
         <Box p={1.5}>
            <Typography variant="medium" color="text.secondary">
               No chat messages available for this live stream.
            </Typography>
         </Box>
      )
   }

   return (
      <Stack spacing={0} component={TransitionGroup}>
         {chatEntries.map((entry, index) => (
            <Collapse key={entry.id}>
               <Box ref={index === chatEntries.length - 1 ? ref : null}>
                  <ReadOnlyChatEntry entry={entry} />
               </Box>
            </Collapse>
         ))}
      </Stack>
   )
}

type ReadOnlyChatEntryProps = {
   entry: LivestreamChatEntry
}

const ReadOnlyChatEntry = ({ entry }: ReadOnlyChatEntryProps) => {
   const { livestream, seekToAndPlay } = useRecordingFormContext()
   const { formattedTime, seconds } = useTimeSinceEntry(entry, livestream)

   // Get reaction counts (read-only, no user reaction tracking)
   const reactions = useMemo(() => createChatCardReactions(entry), [entry])

   const handleTimestampClick = useCallback(() => {
      if (seconds !== null && seconds > 0) {
         seekToAndPlay(seconds)
      }
   }, [seconds, seekToAndPlay])

   return (
      <ChatCard
         entry={entry}
         timestamp={formattedTime}
         reactions={reactions}
         isReadOnly={true}
         onTimestampClick={handleTimestampClick}
      />
   )
}

const useTimeSinceEntry = (
   entry: LivestreamChatEntry,
   livestream?: LivestreamEvent
) => {
   return useMemo(() => {
      if (!livestream || !entry.timestamp) {
         return { formattedTime: null, seconds: null }
      }

      // Use startedAt if available (actual start time), otherwise use start (scheduled start time)
      const livestreamStart = livestream.startedAt
         ? livestream.startedAt.toDate()
         : livestream.start?.toDate()

      if (!livestreamStart) {
         return { formattedTime: null, seconds: null }
      }

      const chatEntryTime = entry.timestamp.toDate()

      // Calculate time from livestream start to when the chat message was sent
      const formattedTime = DateUtil.formatElapsedTime(
         livestreamStart,
         chatEntryTime
      )
      const seconds = DateUtil.getSecondsBetweenDates(
         livestreamStart,
         chatEntryTime
      )

      return { formattedTime, seconds }
   }, [entry.timestamp, livestream])
}
