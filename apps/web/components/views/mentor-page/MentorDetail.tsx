import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { sxStyles } from "@careerfairy/shared-ui"
import { Button, Stack, Typography } from "@mui/material"
import CircularLogo from "../common/logos/CircularLogo"

const styles = sxStyles({
   root: {
      flexDirection: "column",
      gap: "16px",
   },
   displayName: {
      color: "neutral.900",
      fontSize: "24px",
      fontWeight: 600,
      lineHeight: "36px",
   },
   position: {
      color: "neutral.400",
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "20px",
   },
   story: {
      color: "neutral.800",
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "24px",
   },
   linkedInButton: (theme) => ({
      color: `${theme.brand.info[700]}`,
      border: `1px solid ${theme.brand.info[400]}`,
      fontSize: "14px",
      lineHeight: "20px",
      "&:hover": {
         border: `1px solid ${theme.brand.info[400]}`,
         backgroundColor: `${theme.brand.info[50]}`,
      },
   }),
})

const SpeakerAvatar = ({ mentor, companyName }: MentorDetailProps) => {
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

type MentorDetailProps = {
   mentor: PublicCreator
   companyName: string
}

export const MentorDetail = ({ mentor, companyName }: MentorDetailProps) => {
   if (!mentor) return null

   return (
      <Stack sx={styles.root}>
         <SpeakerAvatar mentor={mentor} companyName={companyName} />
         <Button
            sx={styles.linkedInButton}
            variant="outlined"
            onClick={() => window.open(mentor?.linkedInUrl, "_blank")}
         >
            Reach out on LinkedIn
         </Button>
         <Typography sx={styles.story}>{mentor?.story}</Typography>
      </Stack>
   )
}
