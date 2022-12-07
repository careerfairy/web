import React from "react"
import { Box } from "@mui/material"
import { sxStyles } from "../../../../../types/commonTypes"
import ChatWidget from "../../sharedComponents/chat/ChatWidget"

const styles = sxStyles({
   scrollToBottom: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      height: "calc(100vh - 66px)",
      background: "transparent",
      "& > div": {
         padding: 1.4,
         overflowX: "hidden",
      },
   },
   chatContainer: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
   },
})

const ChatCategory = () => {
   return (
      <Box sx={styles.chatContainer}>
         <ChatWidget scrollToBottomSx={styles.scrollToBottom} />
      </Box>
   )
}

export default ChatCategory
