import { Speaker } from "@careerfairy/shared-lib/livestreams/livestreams"
import { Avatar, AvatarGroup, Box, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import BrandedTooltip from "../../../../common/tooltips/BrandedTooltip"

const styles = sxStyles({
   avatarGroup: {
      "& .MuiAvatar-root": {
         width: 36,
         height: 36,
         fontSize: "14px",
         fontWeight: 500,
         border: "2px solid",
         borderColor: "background.paper",
      },
      "& .MuiAvatarGroup-avatar": {
         backgroundColor: "neutral.700",
         color: "background.paper",
         fontSize: "14px",
         fontWeight: 500,
      },
   },
   tooltip: {
      maxWidth: 300,
   },
   speakerName: {
      fontWeight: 500,
      mb: 0.5,
   },
   speakerPosition: {
      fontSize: "11px",
      color: "neutral.600",
   },
})

interface SpeakerAvatarsProps {
   speakers: Speaker[]
   maxVisible?: number
   showTooltip?: boolean
}

export const SpeakerAvatars = ({
   speakers,
   maxVisible = 3,
   showTooltip = true,
}: SpeakerAvatarsProps) => {
   if (!speakers || speakers.length === 0) {
      return null
   }

   const renderTooltipContent = () => {
      if (!showTooltip || speakers.length === 0) {
         return null
      }

      return (
         <Box sx={styles.tooltip}>
            {speakers.slice(0, 5).map((speaker, index) => (
               <Box
                  key={speaker.id || index}
                  sx={{ mb: index < Math.min(speakers.length, 5) - 1 ? 1 : 0 }}
               >
                  <Typography variant="small" sx={styles.speakerName}>
                     {speaker.firstName} {speaker.lastName}
                  </Typography>
                  {Boolean(speaker.position) && (
                     <Typography variant="xsmall" sx={styles.speakerPosition}>
                        {speaker.position}
                     </Typography>
                  )}
               </Box>
            ))}
            {speakers.length > 5 && (
               <Typography
                  variant="xsmall"
                  sx={{ color: "neutral.600", mt: 0.5 }}
               >
                  +{speakers.length - 5} more speakers
               </Typography>
            )}
         </Box>
      )
   }

   const avatarGroup = (
      <AvatarGroup
         max={maxVisible + 1}
         sx={styles.avatarGroup}
         spacing="medium"
      >
         {speakers.map((speaker) => (
            <Avatar
               key={speaker.id}
               src={speaker.avatar || undefined}
               alt={`${speaker.firstName} ${speaker.lastName}`}
            >
               {!speaker.avatar && speaker.firstName && speaker.lastName
                  ? `${speaker.firstName[0]}${speaker.lastName[0]}`
                  : "?"}
            </Avatar>
         ))}
      </AvatarGroup>
   )

   if (!showTooltip) {
      return avatarGroup
   }

   return (
      <BrandedTooltip title={renderTooltipContent()} placement="top" arrow>
         <Box sx={{ display: "inline-flex", cursor: "pointer" }}>
            {avatarGroup}
         </Box>
      </BrandedTooltip>
   )
}
