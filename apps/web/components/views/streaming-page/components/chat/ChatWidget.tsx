import React from "react"
import { ChatInput } from "./ChatInput"
import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { EmptyChatView } from "./EmptyChatView"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
   },
   content: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
   },
})

export const ChatWidget = () => {
   return (
      <Box sx={styles.root}>
         <Box sx={styles.content}>
            <EmptyChatView />
         </Box>
         <ChatInput />
      </Box>
   )
}
