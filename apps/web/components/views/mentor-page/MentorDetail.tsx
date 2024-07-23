import { Group } from "@careerfairy/shared-lib/groups"
import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { sxStyles } from "@careerfairy/shared-ui"
import { Button, Link, Stack, Typography, useTheme } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useAnonymousUserCountryCode from "components/custom-hook/useAnonymousUserCountryCode"
import useIsDesktop from "components/custom-hook/useIsDesktop"
import { useMemo } from "react"
import { ChevronDown, ChevronUp } from "react-feather"
import { LinkedInIcon } from "../common/icons/LinkedInIcon"
import CollapsibleText from "../common/inputs/CollapsibleText"
import { SpeakerAvatar } from "./SpeakersAvatar"

const styles = sxStyles({
   root: {
      flexDirection: "column",
      gap: "16px",
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
   mobileCollapsibleContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      "& button": {
         width: "100%",
      },
   },
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

const ShowMoreButton = (
   <Button variant="text" color="grey" endIcon={<ChevronDown />}>
      Show more
   </Button>
)

const ShowLessButton = (
   <Button variant="text" color="grey" endIcon={<ChevronUp />}>
      Show less
   </Button>
)

type PlaceholderStory = {
   companyName: string
} & Pick<MentorDetailProps, "mentor" | "numSparks" | "numLivestreams">

const getMentorPlaceholderStory = ({
   mentor,
   companyName,
   numSparks,
   numLivestreams,
}: PlaceholderStory) => {
   const hasCreatedSparks = numSparks > 0
   const hasParticipatedInLivestreams = numLivestreams > 0

   if (!hasCreatedSparks && !hasParticipatedInLivestreams) {
      return mentor.linkedInUrl
         ? `Reach out to ${mentor.firstName} on LinkedIn and ask your own questions!`
         : `Continue exploring and go back to ${companyName}'s company page to see more of what they have to offer!`
   }

   const sparksMessage = hasCreatedSparks
      ? `has created ${numSparks} Sparks`
      : ""
   const livestreamsMessage = hasParticipatedInLivestreams
      ? `has participated in ${numLivestreams} live streams`
      : ""

   const introMessage = `${mentor.firstName} ${sparksMessage}${
      hasCreatedSparks && hasParticipatedInLivestreams ? " and " : ""
   }${livestreamsMessage}.`

   const pronoun = numSparks + numLivestreams > 1 ? "them" : "it"
   const watchMessage = `Watch ${pronoun} to know ${mentor.firstName} and ${companyName} better!`

   const reachOutMessage = mentor.linkedInUrl
      ? `After that reach out to ${mentor.firstName} on LinkedIn and ask your own questions!`
      : `After that continue exploring and go back to ${companyName}'s company page to see more of what they have to offer!`

   return `${introMessage} ${watchMessage} ${reachOutMessage}`
}

type MentorDetailProps = {
   mentor: PublicCreator
   group: Group
   numSparks: number
   numLivestreams: number
}

export const MentorDetail = ({
   mentor,
   group,
   numSparks,
   numLivestreams,
}: MentorDetailProps) => {
   const isDesktop = useIsDesktop()
   const { userData, isLoggedIn } = useAuth()

   const { anonymousUserCountryCode, isLoading } = useAnonymousUserCountryCode()

   const showLinkedInButton = useMemo(() => {
      const isTargetedUser =
         group.targetedCountries.filter((country) => {
            const userCode = isLoggedIn
               ? userData?.universityCountryCode
               : anonymousUserCountryCode

            return country.id === userCode
         }).length > 0

      return !isLoading && mentor?.linkedInUrl && isTargetedUser
   }, [
      group.targetedCountries,
      isLoading,
      mentor?.linkedInUrl,
      isLoggedIn,
      userData?.universityCountryCode,
      anonymousUserCountryCode,
   ])

   if (!mentor) return null

   const placeholderStory = getMentorPlaceholderStory({
      mentor,
      companyName: group.universityName,
      numSparks,
      numLivestreams,
   })

   return (
      <Stack sx={styles.root}>
         <SpeakerAvatar mentor={mentor} companyName={group.universityName} />
         {Boolean(showLinkedInButton) && (
            <Button
               sx={styles.linkedInButton}
               variant="outlined"
               LinkComponent={Link}
               href={mentor.linkedInUrl}
               target="_blank"
            >
               <LinkedInButton />
            </Button>
         )}
         {isDesktop || !mentor.story ? (
            <Typography sx={styles.story}>
               {mentor.story ? mentor.story : placeholderStory}
            </Typography>
         ) : (
            <CollapsibleText
               text={mentor.story ? mentor.story : placeholderStory}
               textStyle={styles.story}
               slots={{
                  expand: ShowMoreButton,
                  collapse: ShowLessButton,
               }}
               containerSx={styles.mobileCollapsibleContainer}
            />
         )}
      </Stack>
   )
}
