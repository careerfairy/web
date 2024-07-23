import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { sxStyles } from "@careerfairy/shared-ui"
import { Stack, Typography } from "@mui/material"
import CircularLogo from "../common/logos/CircularLogo"

const styles = sxStyles({
   displayName: {
      color: "neutral.900",
      fontSize: "24px",
      fontWeight: 600,
      lineHeight: "36px",
   },
   position: {
      color: "neutral.500",
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "20px",
   },
})

type SpeakerAvatarProps = {
   mentor: PublicCreator
   companyName: string
}

export const SpeakerAvatar = ({ mentor, companyName }: SpeakerAvatarProps) => {
   const mentorName = `${mentor.firstName ?? ""} ${mentor.lastName ?? ""}`

   return (
      <Stack spacing={0.75} direction="row" width="100%">
         <CircularLogo
            size={80}
            src={mentor?.avatarUrl}
            alt={`Avatar of ${mentorName}`}
            objectFit="cover"
         />
         <Stack>
            <Typography sx={styles.displayName} variant="h6">
               {mentorName}
            </Typography>
            <Typography sx={styles.position} variant="body2">
               {mentor.position} at <b>{companyName}</b>
            </Typography>
         </Stack>
      </Stack>
   )
}
