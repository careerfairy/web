import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
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
         <Button
            variant="contained"
            onClick={createDraftLivestream}
            disabled={isCreating}
            sx={styles.scheduleButton}
         >
            {isCreating ? "Creating..." : "Schedule a live stream"}
         </Button>
      </CardCustom>
   )
}

type UpcomingVariantProps = {
   livestream: LivestreamEvent
}

const UpcomingVariant = ({ livestream }: UpcomingVariantProps) => {
   const { userData } = useAuth()
   const router = useRouter()
   const { showSuccessSnackbar, showErrorSnackbar } = useSnackbarNotifications()
   const [, copyToClipboard] = useCopyToClipboard()

   const handleShareClick = useCallback(async () => {
      try {
         const adminGroupsClaim = userData?.customClaims?.adminGroups as AdminGroupsClaim
         const referralCode = adminGroupsClaim?.[0]?.referralCode

         const shareUrl = makeLivestreamEventDetailsInviteUrl(livestream.id, referralCode)
         
         await copyToClipboard(shareUrl)
         showSuccessSnackbar("Link copied to clipboard!")
      } catch (error) {
         console.error("Error sharing livestream:", error)
         showErrorSnackbar("Failed to copy link")
      }
   }, [livestream.id, userData, copyToClipboard, showSuccessSnackbar, showErrorSnackbar])

   const handleEnterRoomClick = useCallback(async () => {
      try {
         const streamerLink = await buildStreamerLink(livestream.id)
         if (streamerLink) {
            router.push(streamerLink)
         } else {
            showErrorSnackbar("Unable to enter live stream room")
         }
      } catch (error) {
         console.error("Error entering livestream room:", error)
         showErrorSnackbar("Failed to enter live stream room")
      }
   }, [livestream.id, router, showErrorSnackbar])

   // Get actual metrics from the livestream - using mock data as fallback
   const metrics = {
      talentReached: livestream.analytics?.talentReached || 0,
      registrations: livestream.analytics?.registrations || 0,
      totalQuestions: livestream.analytics?.totalQuestions || 0,
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
                  value={metrics.talentReached}
               />
               <MetricCard
                  icon={<User strokeWidth={2} />}
                  name="Registrations"
                  value={metrics.registrations}
               />
               <MetricCard
                  icon={<MessageSquare strokeWidth={2} />}
                  name="Questions"
                  value={metrics.totalQuestions}
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
               <Button
                  variant="contained"
                  onClick={handleEnterRoomClick}
                  sx={styles.enterRoomButton}
               >
                  Enter the live stream room
               </Button>
            </Stack>
         </Box>
      </CardCustom>
   )
}

export const NewLivestreamTile = () => {
   try {
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
   } catch (error) {
      console.error("Error in NewLivestreamTile:", error)
      return (
         <CardCustom title="Live Stream Tile">
            <Box p={2}>
               <Typography>Unable to load live stream information</Typography>
            </Box>
         </CardCustom>
      )
   }
}