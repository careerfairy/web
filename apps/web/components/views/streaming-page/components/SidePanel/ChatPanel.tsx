import React from "react"
import { SidePanelView } from "./SidePanelView"
import { MessageCircle } from "react-feather"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { sxStyles } from "types/commonTypes"
import { ChatInput } from "../chat/ChatInput"
import { ChatList } from "../chat/ChatList"
import { useScrollToBottom } from "components/custom-hook/utils/useScrollToBottom"

const styles = sxStyles({
   root: {
      p: 0,
      display: "flex",
      flexDirection: "column",
      overflowX: "hidden",
      position: "relative",
   },
   portraitChat: {
      minHeight: 372,
   },
   landscapeChat: {
      minHeight: 294,
   },
})

export const ChatPanel = () => {
   const isMobile = useStreamIsMobile()
   const streamIsLandscape = useStreamIsLandscape()
   const { scrollToBottom, ref } = useScrollToBottom()

   const chatPanelStyles = streamIsLandscape
      ? styles.landscapeChat
      : styles.portraitChat

   return (
      <SidePanelView
         id="chat-panel"
         title="Chat"
         icon={<MessageCircle />}
         contentWrapperStyles={[styles.root, isMobile && chatPanelStyles]}
         bottomContent={<ChatInput />}
         contentRef={ref}
      >
         <ChatList scrollToBottom={scrollToBottom} />
      </SidePanelView>
   )
}
