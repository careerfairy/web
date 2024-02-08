import React from "react"
import { SidePanelView } from "./SidePanelView"
import { MessageCircle } from "react-feather"

export const ChatPanel = () => {
   return (
      <SidePanelView id="chat-panel" title="Chat" icon={<MessageCircle />}>
         content
      </SidePanelView>
   )
}
