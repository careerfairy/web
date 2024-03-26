import { useStreamingContext } from "../../context"
import { useChatEntries } from "components/custom-hook/streaming/useChatEntries"
import { MAX_STREAM_CHAT_ENTRIES } from "constants/streams"
import { EmptyChatView } from "./EmptyChatView"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { Box, CircularProgress, Slide } from "@mui/material"
import { useEffect, useMemo, useRef } from "react"
import { ChatEntry } from "./ChatEntry"
import AutoSizer from "react-virtualized-auto-sizer"

import ScrollToBottom, {
   useScrollToBottom,
   useSticky,
} from "react-scroll-to-bottom"
import { TransitionGroup } from "react-transition-group"
import { useAuth } from "HOCs/AuthProvider"
import { isMe } from "./util"

export const ChatList = () => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <AutoSizer>
            {({ height, width }) => {
               return (
                  <Box
                     component={ScrollToBottom}
                     scrollViewClassName="chat-list"
                     initialScrollBehavior="auto"
                     width={width}
                     sx={{
                        "& .chat-list": {
                           overflowX: "hidden",
                        },
                     }}
                     height={height}
                  >
                     <Content />
                  </Box>
               )
            }}
         </AutoSizer>
      </SuspenseWithBoundary>
   )
}

export const Content = () => {
   const { authenticatedUser } = useAuth()
   const { livestreamId, agoraUserId } = useStreamingContext()
   const { data: chatEntries } = useChatEntries(livestreamId, {
      limit: MAX_STREAM_CHAT_ENTRIES,
   })

   const scrollToBottom = useScrollToBottom()
   const [sticky] = useSticky() //  In order for use sticky hook to work,
   const stickyRef = useRef<boolean>(sticky)
   const containerRef = useRef<HTMLElement>(null)

   stickyRef.current = sticky
   useEffect(() => {
      //  the component must be the child of a scroll to bottom
      if (stickyRef.current) {
         scrollToBottom({ behavior: "auto" })
      }
   }, [chatEntries, scrollToBottom])

   const sortedChatEntries = useMemo(() => chatEntries.reverse(), [chatEntries])

   if (!chatEntries.length) return <EmptyChatView />

   return (
      <Box width="100%" height="100%" ref={containerRef}>
         <TransitionGroup>
            {sortedChatEntries.map((entry) => (
               <Slide
                  direction={
                     isMe(entry, agoraUserId, authenticatedUser.email)
                        ? "left"
                        : "right"
                  }
                  key={entry.id}
                  container={containerRef.current}
               >
                  <ChatEntry entry={entry} />
               </Slide>
            ))}
         </TransitionGroup>
      </Box>
   )
}
