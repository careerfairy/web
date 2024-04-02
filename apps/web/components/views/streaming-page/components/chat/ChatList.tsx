import { CircularProgress, IconButton } from "@mui/material"
import { Fragment, useEffect, useMemo, useRef } from "react"
import { ChevronDown } from "react-feather"
import { ChatEntry } from "./ChatEntry"
import { EmptyChatView } from "./EmptyChatView"
import { MAX_STREAM_CHAT_ENTRIES } from "constants/streams"
import { ScrollToBottom } from "components/custom-hook/utils/useScrollToBottom"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
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
         strokeWidth: 4,
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
   const [ref, isBottom] = useInView()
   const isBottomRef = useRef<boolean>(isBottom)
   isBottomRef.current = isBottom

   const { livestreamId } = useStreamingContext()
   const { data: chatEntries } = useChatEntries(livestreamId, {
      limit: MAX_STREAM_CHAT_ENTRIES,
   })

   useEffect(() => {
      // Scroll to bottom on first load
      scrollToBottom("instant")
   }, [scrollToBottom])

   useEffect(() => {
      if (isBottomRef.current) {
         scrollToBottom("smooth")
      }
   }, [chatEntries, scrollToBottom])

   const sortedChatEntries = useMemo(
      () => [...chatEntries].reverse(),
      [chatEntries]
   )

   if (!chatEntries.length) return <EmptyChatView />

   return (
      <Fragment>
         <Box sx={styles.list}>
            {sortedChatEntries.map((entry, index) => (
               <ChatEntry
                  key={entry.id}
                  entry={entry}
                  ref={index === sortedChatEntries.length - 1 ? ref : null}
               />
            ))}
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
