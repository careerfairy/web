import { Typography } from "@mui/material"
import { BaseDetailView } from "./BaseDetailView"

type ChatViewProps = {
   onBack: () => void
}

export const ChatView = ({ onBack }: ChatViewProps) => {
   return (
      <BaseDetailView title="Chat" onBack={onBack}>
         <Typography variant="medium" color="text.secondary">
            Chat view content coming soon...
         </Typography>
      </BaseDetailView>
   )
}
