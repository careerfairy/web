import { CircularProgress, IconButton, Slide } from "@mui/material"
import { Fragment, useEffect, useMemo } from "react"
import { ChevronDown } from "react-feather"
import { ChatEntry } from "./ChatEntry"
import { EmptyChatView } from "./EmptyChatView"
import { MAX_STREAM_CHAT_ENTRIES } from "constants/streams"
import { ScrollToBottom } from "components/custom-hook/utils/useScrollToBottom"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { TransitionGroup } from "react-transition-group"
import { isMe } from "./util"
import { useAuth } from "HOCs/AuthProvider"
import { useChatEntries } from "components/custom-hook/streaming/useChatEntries"
import { useInView } from "react-intersection-observer"
import { useStreamingContext } from "../../context"
import { sxStyles } from "types/commonTypes"
import { Box } from "@mui/material"
import { Grow } from "@mui/material"

const ARROW_HEIGHT = 40

const styles = sxStyles({
   button: {
      ml: "auto",
      position: "sticky",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      bottom: 15,
      right: 15,
      "& svg": {
         color: (theme) => theme.palette.grey[500],
         height: 15,
         width: 15,
      },
   },
   list: {
      mb: `-${ARROW_HEIGHT}px`,
      bgcolor: (theme) => theme.brand.white[100],
   },
})

type Props = {
   scrollToBottom: ScrollToBottom["scrollToBottom"]
}

export const ChatList = (props: Props) => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <Content {...props} />
      </SuspenseWithBoundary>
   )
}

export const Content = ({ scrollToBottom }: Props) => {
   const { authenticatedUser } = useAuth()

   const [ref, isBottom] = useInView()

   const { livestreamId, agoraUserId } = useStreamingContext()
   const { data: chatEntries } = useChatEntries(livestreamId, {
      limit: MAX_STREAM_CHAT_ENTRIES,
   })

   useEffect(() => {
      // Scroll to bottom on first load
      scrollToBottom("instant")
   }, [scrollToBottom])

   useEffect(() => {
      if (isBottom) {
         scrollToBottom("smooth")
      }
   }, [chatEntries, isBottom, scrollToBottom])

   const sortedChatEntries = useMemo(() => chatEntries.reverse(), [chatEntries])

   if (!chatEntries.length) return <EmptyChatView />

   return (
      <Fragment>
         <Box sx={styles.list}>
            <TransitionGroup>
               {sortedChatEntries.map((entry, index) => (
                  <Slide
                     key={entry.id}
                     direction={
                        isMe(entry, agoraUserId, authenticatedUser.email)
                           ? "left"
                           : "right"
                     }
                     exit={false} // Don't slide out when removed
                     ref={index === sortedChatEntries.length - 1 ? ref : null}
                  >
                     <ChatEntry entry={entry} />
                  </Slide>
               ))}
            </TransitionGroup>
         </Box>
         <Grow in={!isBottom}>
            <Box component="span" sx={styles.button}>
               <IconButton
                  size="small"
                  aria-label="Scroll to bottom"
                  onClick={() => scrollToBottom()}
               >
                  <ChevronDown />
               </IconButton>
            </Box>
         </Grow>
      </Fragment>
   )
}
