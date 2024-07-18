import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { sxStyles } from "@careerfairy/shared-ui"
import { Button, Stack, Typography, useTheme } from "@mui/material"
import { LinkedInIcon } from "../common/icons/LinkedInIcon"
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
      color: "neutral.500",
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
   linkedInButtonInnerContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "baseline",
      height: "20px",
      gap: "6px",
   },
   linkedInButton: (theme) => ({
      color: `${theme.brand.info[700]}`,
      border: `1px solid ${theme.brand.info[400]}`,
      "&:hover": {
         border: `1px solid ${theme.brand.info[400]}`,
         backgroundColor: `${theme.brand.info[50]}`,
      },
      "& svg": {
         width: "14px",
         height: "14px",
         marginTop: "-2px",
      },
   }),
})

const LinkedInButton = () => {
   const theme = useTheme()

   return (
      <Stack sx={styles.linkedInButtonInnerContainer}>
         <LinkedInIcon fill={theme.brand.info[700]} />
         <Typography variant="small">Reach out on LinkedIn</Typography>
      </Stack>
   )
}

const SpeakerAvatar = ({
   mentor,
   companyName,
}: Pick<MentorDetailProps, "mentor" | "companyName">) => {
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

const getMentorPlaceholderStory = ({
   mentor,
   companyName,
   numSparks,
   numLivestreams,
}: MentorDetailProps) => {
   const hasCreatedSparks = numSparks > 0
   const hasParticipatedInLivestreams = numLivestreams > 0

   const mentorName = `${mentor.firstName ?? ""} ${mentor.lastName ?? ""}`

   if (!hasCreatedSparks && !hasParticipatedInLivestreams) {
      return `Reach out to ${mentorName} on LinkedIn and ask your own questions!`
   }

   const sparksMessage = hasCreatedSparks
      ? `has created ${numSparks} Sparks`
      : ""
   const livestreamsMessage = hasParticipatedInLivestreams
      ? `has participated in ${numLivestreams} live streams`
      : ""

   const introMessage = `${mentorName} ${sparksMessage}${
      hasCreatedSparks && hasParticipatedInLivestreams ? " and " : ""
   }${livestreamsMessage}.`

   const pronoun = numSparks + numLivestreams > 1 ? "them" : "it"
   const watchMessage = `Watch ${pronoun} to know ${mentor.firstName} and ${companyName} better!`

   const reachOutMessage = `After that reach out to ${mentor.firstName} on LinkedIn and ask your own questions!`

   return `${introMessage} ${watchMessage} ${reachOutMessage}`
}

type MentorDetailProps = {
   mentor: PublicCreator
   companyName: string
   numSparks: number
   numLivestreams: number
}

export const MentorDetail = ({
   mentor,
   companyName,
   numSparks,
   numLivestreams,
}: MentorDetailProps) => {
   if (!mentor) return null

   const placeholderStory = getMentorPlaceholderStory({
      mentor,
      companyName,
      numSparks,
      numLivestreams,
   })

   return (
      <Stack sx={styles.root}>
         <SpeakerAvatar mentor={mentor} companyName={companyName} />
         <Button
            sx={styles.linkedInButton}
            variant="outlined"
            onClick={() => window.open(mentor?.linkedInUrl, "_blank")}
         >
            <LinkedInButton />
         </Button>
         <Typography sx={styles.story}>
            {mentor.story ? mentor.story : placeholderStory}
         </Typography>
      </Stack>
   )
}
