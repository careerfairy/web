import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LoadingButton } from "@mui/lab"
import { Box, Button, Stack, Typography } from "@mui/material"
import { Eye, User, MessageSquare } from "react-feather"
import { useCallback, useState } from "react"
import { sxStyles } from "types/commonTypes"
import CardCustom from "../../common/CardCustom"
import { useLivestreamRouting } from "../../events/useLivestreamRouting"
import { useMainPageContext } from "../MainPageProvider"
import CustomLivestreamCard from "./CustomLivestreamCard"
import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams"
import { useAuth } from "HOCs/AuthProvider"
import { useRouter } from "next/router"
import { firebaseServiceInstance } from "data/firebase/FirebaseService"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { buildStreamerLink } from "util/streamUtil"
import { AdminGroupsClaim, UserData } from "@careerfairy/shared-lib/users"
import { makeLivestreamEventDetailsInviteUrl } from "util/makeUrls"
import { useCopyToClipboard } from "react-use"

const styles = sxStyles({
   // No upcoming variant styles
   noUpcomingCard: {
      backgroundColor: (theme) => theme.brand.white[300],
      height: "100%",
      "& .MuiCardContent-root": {
         height: "100%",
         display: "flex",
         flexDirection: "column",
         justifyContent: "center",
         alignItems: "center",
         textAlign: "center",
         p: 3,
      },
   },
   noUpcomingTitle: {
      color: "neutral.800",
      fontWeight: "600", // body semibold
      mb: 1,
   },
   noUpcomingSubtitle: {
      color: "neutral.800",
      fontWeight: "400", // body regular
      mb: 3,
      maxWidth: "300px",
   },
   scheduleButton: {
      backgroundColor: (theme) => theme.brand.purple[600],
      color: (theme) => theme.brand.white[50],
      "&:hover": {
         backgroundColor: (theme) => theme.brand.purple[700],
      },
   },
   
   // Upcoming variant styles
   upcomingCard: {
      height: "100%",
      "& .MuiCardContent-root": {
         height: "100%",
         display: "flex",
         flexDirection: "column",
         p: 0,
      },
   },
   livestreamCardWrapper: {
      flex: 1,
      mb: 2,
   },
   metricsAndActionsContainer: {
      px: 2,
      pb: 2,
   },
   metricsContainer: {
      display: "flex",
      gap: 1,
      mb: 2,
   },
   metricCard: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      p: 1.5,
      backgroundColor: (theme) => theme.brand.white[300],
      borderRadius: "6px",
   },
   metricIcon: {
      width: 20,
      height: 20,
      color: "secondary.600",
      mb: 0.5,
   },
   metricName: {
      color: "neutral.600",
      textAlign: "center",
   },
   metricValue: {
      color: "neutral.800",
      fontWeight: "600", // body H4 semibold
   },
   actionsContainer: {
      display: "flex",
      gap: 1,
   },
   shareButton: {
      flex: 1,
      backgroundColor: "secondary.50",
      color: "secondary.600",
      border: `1px solid`,
      borderColor: "secondary.200",
      "&:hover": {
         backgroundColor: "secondary.100",
         borderColor: "secondary.300",
      },
   },
   enterRoomButton: {
      flex: 1,
      backgroundColor: (theme) => theme.brand.purple[600],
      color: (theme) => theme.brand.white[50],
      "&:hover": {
         backgroundColor: (theme) => theme.brand.purple[700],
      },
   },
})

type MetricCardProps = {
   icon: React.ReactNode
   name: string
   value: string | number
}

const MetricCard = ({ icon, name, value }: MetricCardProps) => (
   <Box sx={styles.metricCard}>
      <Box sx={styles.metricIcon}>{icon}</Box>
      <Typography variant="xsmall" sx={styles.metricName}>
         {name}
      </Typography>
      <Typography variant="brandedH4" sx={styles.metricValue}>
         {value}
      </Typography>
   </Box>
)

const NoUpcomingVariant = () => {
   const { createDraftLivestream, isCreating } = useLivestreamRouting()

   return (
      <CardCustom title={undefined} sx={styles.noUpcomingCard}>
         <Typography variant="brandedBody" sx={styles.noUpcomingTitle}>
            No upcoming live streams
         </Typography>
         <Typography variant="brandedBody" sx={styles.noUpcomingSubtitle}>
            Schedule your next live stream to engage your audience. Once published it will appear here.
         </Typography>
         <LoadingButton
            variant="contained"
            onClick={createDraftLivestream}
            loading={isCreating}
            sx={styles.scheduleButton}
         >
            Schedule a live stream
         </LoadingButton>
      </CardCustom>
   )
}

type UpcomingVariantProps = {
   livestream: LivestreamEvent
}

function getUserJoiningLinkType(
   userData: UserData,
   groupId: string,
   adminGroups: AdminGroupsClaim
) {
   if (!userData) {
      return "main-streamer"
   }

   const role = adminGroups[groupId as string]

   if (role?.role === "OWNER") {
      return "main-streamer"
   }

   return "joining-streamer"
}

const UpcomingVariant = ({ livestream }: UpcomingVariantProps) => {
   const { userData, adminGroups } = useAuth()
   const router = useRouter()
   const { groupId } = router.query
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const [_, copyToClipboard] = useCopyToClipboard()
   const [enterRoomLoading, setEnterRoomLoading] = useState(false)

   const handleShareClick = useCallback(() => {
      const eventUrl = makeLivestreamEventDetailsInviteUrl(
         livestream.id,
         userData?.referralCode
      )

      copyToClipboard(eventUrl)
      successNotification(
         "Live stream link has been copied to your clipboard",
         "Copied"
      )
   }, [copyToClipboard, livestream.id, successNotification, userData?.referralCode])

   const handleEnterRoomClick = useCallback(() => {
      setEnterRoomLoading(true)
      firebaseServiceInstance
         .getLivestreamSecureToken(livestream.id)
         .then((doc) => {
            if (doc.exists) {
               let secureToken: string = doc.data().value
               const type = getUserJoiningLinkType(
                  userData,
                  groupId as string,
                  adminGroups
               )

               window
                  .open(
                     buildStreamerLink(type, livestream.id, secureToken),
                     "_blank"
                  )
                  ?.focus()
            } else {
               errorNotification(
                  "Live stream doesn't have a secure token",
                  "Failed to redirect to the live stream",
                  {
                     livestreamId: livestream.id,
                  }
               )
            }
         })
         .catch((e) => {
            errorNotification(e, "Failed to redirect to the live stream", {
               livestreamId: livestream.id,
            })
         })
         .finally(() => {
            setEnterRoomLoading(false)
         })
   }, [adminGroups, errorNotification, groupId, livestream.id, userData])

   // Mock data for now - these should come from the livestream analytics
   const mockMetrics = {
      talentReached: 1234,
      registrations: 89,
      totalQuestions: 45,
   }

   return (
      <CardCustom title={undefined} sx={styles.upcomingCard}>
         <Box sx={styles.livestreamCardWrapper}>
            <CustomLivestreamCard
               event={livestream}
               location={ImpressionLocation.unknown}
               disableClick={true}
            />
         </Box>
         
         <Box sx={styles.metricsAndActionsContainer}>
            {/* Key Metrics */}
            <Stack sx={styles.metricsContainer}>
               <MetricCard
                  icon={<Eye strokeWidth={2} />}
                  name="Talent reached"
                  value={mockMetrics.talentReached}
               />
               <MetricCard
                  icon={<User strokeWidth={2} />}
                  name="Registrations"
                  value={mockMetrics.registrations}
               />
               <MetricCard
                  icon={<MessageSquare strokeWidth={2} />}
                  name="Questions"
                  value={mockMetrics.totalQuestions}
               />
            </Stack>

            {/* Action Buttons */}
            <Stack sx={styles.actionsContainer}>
               <Button
                  variant="outlined"
                  onClick={handleShareClick}
                  sx={styles.shareButton}
               >
                  Share with your audience
               </Button>
               <LoadingButton
                  variant="contained"
                  onClick={handleEnterRoomClick}
                  loading={enterRoomLoading}
                  sx={styles.enterRoomButton}
               >
                  Enter the live stream room
               </LoadingButton>
            </Stack>
         </Box>
      </CardCustom>
   )
}

export const NewLivestreamTile = () => {
   const { nextLivestream, nextDraft } = useMainPageContext()

   // Check if loading
   const isLoading = nextDraft === undefined || nextLivestream === undefined

   // Check if no upcoming livestreams
   const noLivestreams = nextDraft === null && nextLivestream === null

   // Determine which livestream to show (published takes priority over draft)
   const upcomingLivestream = nextLivestream || nextDraft

   if (isLoading) {
      // Return loading skeleton or the existing loading state
      return <CardCustom title={undefined}>Loading...</CardCustom>
   }

   if (noLivestreams || !upcomingLivestream) {
      return <NoUpcomingVariant />
   }

   return <UpcomingVariant livestream={upcomingLivestream} />
}