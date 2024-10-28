import { Group } from "@careerfairy/shared-lib/groups"
import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { sxStyles } from "@careerfairy/shared-ui"
import {
   Button,
   Skeleton,
   Stack,
   SxProps,
   Typography,
   useTheme,
} from "@mui/material"
import useFingerPrint from "components/custom-hook/useFingerPrint"
import useIsDesktop from "components/custom-hook/useIsDesktop"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useCallback } from "react"
import { ChevronDown, ChevronUp } from "react-feather"
import { combineStyles } from "types/commonTypes"
import { LinkedInIcon } from "../common/icons/LinkedInIcon"
import CollapsibleText from "../common/inputs/CollapsibleText"
import { useIsTargetedUser } from "../sparks/components/spark-card/Notifications/linkedin/useIsTargetedUser"
import { LivestreamsCarousel } from "./LivestreamsCarousel"
import { MentorSparksCarousel } from "./MentorSparksCarousel"
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
      flexShrink: 0,

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
   mentorContentContainer: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      width: "100%",
   },
   header: {
      alignItems: "center",
      gap: 2,
   },
   contentTitle: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[800],
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
         ? "Sparks and live streams"
         : hasCreatedSparks
         ? "Sparks"
         : hasParticipatedInLivestreams
         ? "Live streams"
         : "" // this never happens because we only show a mentor if there is at least one spark or live stream

   const watchMessage = `Hi! Watch my ${availableContentMessage} to get to know me better and understand how it is to work at ${companyName}.`

   const noLinkedInNoJobs = `${watchMessage}`
   const noLinkedInWithJobs = `${watchMessage} After that, visit ${companyName}'s company page to discover more career opportunities!`

   const notTargetedUserCountry = hasJobs
      ? noLinkedInWithJobs
      : noLinkedInNoJobs

   const targetCountryWithLinkedIn = `${watchMessage} Reach out to me on LinkedIn anytime to ask your career questions and grow your professional network!`

   const placeholder =
      mentor?.linkedInUrl && isUserFromTargetedCountry
         ? targetCountryWithLinkedIn
         : notTargetedUserCountry

   return placeholder
}

export const MentorDetailLayout = ({ children }) => {
   return <Stack sx={styles.root}>{children}</Stack>
}

type MentorDetailProps = {
   mentor: PublicCreator
   group: Group
   numSparks: number
   numLivestreams: number
   hasJobs: boolean
}

const Header = ({
   mentor,
   group,
   fullWidth = false,
}: Pick<MentorDetailProps, "mentor" | "group"> & { fullWidth?: boolean }) => {
   const { data: visitorId } = useFingerPrint()
   const { trackMentorLinkedInReach } = useFirebaseService()
   const isUserFromTargetedCountry = useIsTargetedUser(group)
   const isMobile = useIsMobile()

   const linkedInOnClick = useCallback(() => {
      trackMentorLinkedInReach(group.groupId, mentor.id, visitorId)
   }, [group?.groupId, mentor?.id, trackMentorLinkedInReach, visitorId])

   if (!mentor) return null

   const isButtonFullWidth = fullWidth ? isMobile : true
   return (
      <Stack
         direction={fullWidth ? { s: "column", md: "row" } : "column"}
         sx={styles.header}
      >
         <SpeakerAvatar mentor={mentor} companyName={group.universityName} />
         {Boolean(isUserFromTargetedCountry && mentor?.linkedInUrl) && (
            <Button
               sx={styles.linkedInButton}
               variant="outlined"
               LinkComponent="a"
               href={mentor.linkedInUrl}
               target="_blank"
               onClick={linkedInOnClick}
               fullWidth={isButtonFullWidth}
            >
               <LinkedInButton />
            </Button>
         )}
      </Stack>
   )
}

const HeaderSkeleton = ({ fullWidth = false }: { fullWidth?: boolean }) => {
   return (
      <Stack
         direction={fullWidth ? { s: "column", md: "row" } : "column"}
         sx={styles.header}
      >
         <Stack spacing={0.75} direction="row" width="100%">
            <Skeleton variant="circular" width={80} height={80} />
            <Stack>
               <Typography variant="h6">
                  <Skeleton width="150px" />
               </Typography>
               <Typography variant="body2">
                  <Skeleton width="250px" />
               </Typography>
            </Stack>
         </Stack>
      </Stack>
   )
}

const Description = ({
   mentor,
   group,
   numSparks,
   numLivestreams,
   hasJobs,
}: MentorDetailProps) => {
   const isDesktop = useIsDesktop()
   const isUserFromTargetedCountry = useIsTargetedUser(group)

   const placeholderStory = getMentorPlaceholderStory({
      mentor,
      companyName: group.universityName,
      numSparks,
      numLivestreams,
      isUserFromTargetedCountry,
      hasJobs,
   })
   return (
      <>
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
      </>
   )
}

const Content = ({
   livestreams,
   sparks,
   sx,
}: {
   livestreams: LivestreamEvent[]
   sparks: Spark[]
   sx?: SxProps
}) => {
   return (
      <Stack sx={combineStyles(styles.mentorContentContainer, sx)}>
         {Boolean(sparks.length) && (
            <MentorSparksCarousel
               sparks={sparks}
               title={
                  <Typography variant="brandedH5" sx={styles.contentTitle}>
                     My Sparks
                  </Typography>
               }
            />
         )}
         {Boolean(livestreams.length) && (
            <LivestreamsCarousel
               livestreams={livestreams}
               title={
                  <Typography variant="brandedH5" sx={styles.contentTitle}>
                     Live streams
                  </Typography>
               }
            />
         )}
      </Stack>
   )
}

MentorDetailLayout.Header = Header
MentorDetailLayout.Description = Description
MentorDetailLayout.Content = Content

MentorDetailLayout.HeaderSkeleton = HeaderSkeleton
