import React from "react"
import { StylesProps } from "types/commonTypes"
import Stack from "@mui/material/Stack"
import { Typography } from "@mui/material"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import ReferralWidget from "./ReferralWidget"

const styles: StylesProps = {
   root: {
      textAlign: "center",
   },
}

interface Props {
   event: LivestreamEvent
   title?: string
   subtitle?: string
}
const ReferralPrompt = ({ event, title, subtitle }: Props) => {
   return (
      <Stack spacing={2} sx={styles.root}>
         {(title || subtitle) && (
            <span>
               {title && <Typography variant="h6">{title}</Typography>}
               {subtitle && <Typography variant="body1">{subtitle}</Typography>}
            </span>
         )}
         <ReferralWidget event={event} />
         <Typography variant="body1">
            <b>Pro tip:</b> By sharing the event your questions will be more
            visible for the event hosts
         </Typography>
      </Stack>
   )
}

export default ReferralPrompt
