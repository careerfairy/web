import { LivestreamChatEntry } from "@careerfairy/shared-lib/livestreams"
import { Box } from "@mui/material"
import { forwardRef } from "react"

type Props = {
   entry: LivestreamChatEntry
}

export const ChatEntry = forwardRef<HTMLDivElement, Props>(({ entry }, ref) => {
   return (
      <Box ref={ref} py={3}>
         {entry.message}
      </Box>
   )
})

ChatEntry.displayName = "ChatEntry"
