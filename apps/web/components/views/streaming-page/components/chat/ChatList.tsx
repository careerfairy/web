import { CircularProgress, Collapse, IconButton } from "@mui/material"
import {
   Fragment,
   MouseEvent,
   useCallback,
   useEffect,
   useLayoutEffect,
   useMemo,
   useState,
} from "react"
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
import useMenuState from "components/custom-hook/useMenuState"
import { OptionsMenu } from "./OptionsMenu"
import { TransitionGroup } from "react-transition-group"

const ARROW_HEIGHT = 15

const styles = sxStyles({
   button: {
      height: ARROW_HEIGHT,
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
      mt: "auto",
   },
   loading: {
      m: "auto",
   },
})

type Props = {
   scrollToBottom: ScrollToBottom["scrollToBottom"]
}

export const ChatList = (props: Props) => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress sx={styles.loading} />}>
         <Content {...props} />
      </SuspenseWithBoundary>
   )
}

export const Content = ({ scrollToBottom }: Props) => {
   const [ref, isBottom] = useInView()

   const { livestreamId } = useStreamingContext()
   const { data: chatEntries } = useChatEntries(livestreamId, {
      limit: MAX_STREAM_CHAT_ENTRIES,
   })

   const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)

   const { anchorEl, handleClick, handleClose } = useMenuState()

   useEffect(() => {
      // Scroll to bottom on first load
      scrollToBottom("instant")
   }, [scrollToBottom])

   useLayoutEffect(() => {
      if (isBottom) {
         scrollToBottom("smooth")
      }
   }, [chatEntries, isBottom, scrollToBottom])

   const handleOpenOptions = useCallback(
      (event: MouseEvent<HTMLElement>, entryId: string) => {
         handleClick(event)
         setSelectedEntryId(entryId)
      },
      [handleClick]
   )

   const handleCloseOptions = useCallback(() => {
      handleClose()
      setSelectedEntryId(null)
   }, [handleClose])

   const sortedChatEntries = useMemo(
      () => [...chatEntries].reverse(),
      [chatEntries]
   )

   if (!chatEntries.length) return <EmptyChatView />

   return (
      <Fragment>
         <Box id="chat-list" sx={styles.list}>
            <TransitionGroup>
               {sortedChatEntries.map((entry, index) => (
                  <Collapse enter={false} key={entry.id}>
                     <ChatEntry
                        onOptionsClick={(event) =>
                           handleOpenOptions(event, entry.id)
                        }
                        key={entry.id}
                        entry={entry}
                        ref={
                           index === sortedChatEntries.length - 1 ? ref : null
                        }
                     />
                  </Collapse>
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
         <OptionsMenu
            handleClose={handleCloseOptions}
            anchorEl={anchorEl}
            selectedEntryId={selectedEntryId}
         />
      </Fragment>
   )
}
