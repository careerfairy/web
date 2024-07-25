import { Group } from "@careerfairy/shared-lib/groups"
import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { sxStyles } from "@careerfairy/shared-ui"
import { Button, Stack, Typography, useTheme } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useIsDesktop from "components/custom-hook/useIsDesktop"
import useUserCountryCode from "components/custom-hook/useUserCountryCode"
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
      textOverflow: "ellipsis",
      overflow: "hidden",
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
   isUserFromTargetedCountry: boolean
} & Pick<
   MentorDetailProps,
   "mentor" | "numSparks" | "numLivestreams" | "hasJobs"
>

const getMentorPlaceholderStory = ({
   mentor,
   companyName,
   numSparks,
   numLivestreams,
   isUserFromTargetedCountry,
   hasJobs,
}: PlaceholderStory) => {
   const hasCreatedSparks = numSparks > 0
   const hasParticipatedInLivestreams = numLivestreams > 0

   const availableContentMessage =
      hasCreatedSparks && hasParticipatedInLivestreams
         ? "Sparks (and live streams)"
         : hasCreatedSparks
         ? "Sparks"
         : hasParticipatedInLivestreams
         ? "Live streams"
         : "" // this never happens because we only show a mentor if there is at least one spark or live stream

   const watchMessage = `Hi! Watch my ${availableContentMessage} to get to know me better and understand how it is to work at ${companyName}.`

   const noLinkedInNoJobs = `${watchMessage}`
   const noLinkedInWithJobs = `${watchMessage} After that, visit ${companyName}’s company page to discover more career opportunities!`

   const notTargetedUserCountry = hasJobs
      ? noLinkedInWithJobs
      : noLinkedInNoJobs

   const targetCountryWithLinkedIn = `${watchMessage}. Reach out to me on LinkedIn anytime to ask your career questions and grow your professional network!`

   const placeholder =
      mentor?.linkedInUrl && isUserFromTargetedCountry
         ? targetCountryWithLinkedIn
         : notTargetedUserCountry

   return placeholder
}

type MentorDetailProps = {
   mentor: PublicCreator
   group: Group
   numSparks: number
   numLivestreams: number
   hasJobs: boolean
}

export const MentorDetail = ({
   mentor,
   group,
   numSparks,
   numLivestreams,
   hasJobs,
}: MentorDetailProps) => {
   const isDesktop = useIsDesktop()
   const { userData, isLoggedIn } = useAuth()

   const { userCountryCode, isLoading } = useUserCountryCode()

   const isUserFromTargetedCountry = useMemo(() => {
      if (isLoading) return false

      const isTargetedUser =
         group.targetedCountries.filter((country) => {
            const userCode = isLoggedIn
               ? userData?.universityCountryCode
               : userCountryCode

            return country.id === userCode
         }).length > 0

      return isTargetedUser
   }, [
      group.targetedCountries,
      isLoading,
      isLoggedIn,
      userData?.universityCountryCode,
      userCountryCode,
   ])

   if (!mentor) return null

   const placeholderStory = getMentorPlaceholderStory({
      mentor,
      companyName: group.universityName,
      numSparks,
      numLivestreams,
      isUserFromTargetedCountry,
      hasJobs,
   })

   return (
      <Stack sx={styles.root}>
         <SpeakerAvatar mentor={mentor} companyName={group.universityName} />
         {Boolean(isUserFromTargetedCountry && mentor?.linkedInUrl) && (
            <Button
               sx={styles.linkedInButton}
               variant="outlined"
               LinkComponent="a"
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
