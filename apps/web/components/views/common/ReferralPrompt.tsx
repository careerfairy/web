import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import { StylesProps } from "types/commonTypes"
import useEventSocials from "../../custom-hook/useEventSocials"
import useIsMobile from "../../custom-hook/useIsMobile"
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
   const isMobile = useIsMobile()
   const socials = useEventSocials(event)

   return (
      <Stack spacing={2} sx={styles.root}>
         {Boolean(title || subtitle) && (
            <span>
               {Boolean(title) && <Typography variant="h6">{title}</Typography>}
               {Boolean(subtitle) && (
                  <Typography variant="body1">{subtitle}</Typography>
               )}
            </span>
         )}
         <ReferralWidget
            socials={socials}
            noBackgroundColor
            iconStyle={{ height: isMobile ? "32px" : "unset", padding: 0 }}
         />
         <Typography variant="body1">
            <b>Pro tip:</b> By sharing the event your questions will be more
            visible for the event hosts
         </Typography>
      </Stack>
   )
}

export default ReferralPrompt
