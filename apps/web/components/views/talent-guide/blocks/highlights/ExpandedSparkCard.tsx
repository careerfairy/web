import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { SparkEventActions } from "@careerfairy/shared-lib/sparks/telemetry"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import { Box, Stack } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useFingerPrint from "components/custom-hook/useFingerPrint"
import useIsMobile from "components/custom-hook/useIsMobile"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import FeedCardActions from "components/views/sparks-feed/FeedCardActions"
import SparkCategoryChip from "components/views/sparks/components/spark-card/SparkCategoryChip"
import SparkDetails from "components/views/sparks/components/spark-card/SparkDetails"
import SparkJobButton from "components/views/sparks/components/spark-card/SparkJobButton"
import SparkQuestion from "components/views/sparks/components/spark-card/SparkQuestion"
import VideoPreview from "components/views/sparks/components/spark-card/VideoPreview"
import { useSparksFeedTracker } from "context/spark/SparksFeedTrackerProvider"
import { sparkService } from "data/firebase/SparksService"
import {
   SyntheticEvent,
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import { sxStyles } from "types/commonTypes"
import { buildMentorPageLink } from "utils/routes"
import { ExpandedCard } from "./ExpandedCard"

const styles = sxStyles({
   root: {
      aspectRatio: "9/16",
      height: "100%",
      color: "white",
      display: "flex",
      objectFit: "cover",
      position: "relative",
      flexDirection: "column",
      overflow: "hidden",
   },
   cardContent: {
      zIndex: 1,
      display: "flex",
      flex: 1,
      flexDirection: "column",
      position: "relative",
      justifyContent: "flex-end",
      background:
         "linear-gradient(360deg, rgba(0, 0, 0, 0.30) 0%, rgba(0, 0, 0, 0.00) 105%)",
   },
   contentInner: {
      display: "flex",
      justifyContent: "space-between",
      zIndex: 1,
      p: 1,
      px: 1.5,
   },
   jobButton: {
      mt: { md: 1.5 },
      mb: { xs: 2, md: "unset" },
      mx: { xs: 1, md: "unset" },
   },
   sparkData: {
      justifyContent: "flex-end",
      width: "100%",
   },
   actionsWrapperDesktop: {
      borderRadius: "28px",
      border: (theme) => `1px solid ${theme.palette.neutral["100"]}`,
      background: "rgba(255, 255, 255, 0.15)",
      backdropFilter: "blur(10px)",
      padding: "12px",
      "& .FeedCardActions-root": { margin: 0 },
      "& .MuiButtonBase-root": {
         background: (theme) => theme.brand.white["500"],
      },
   },
   actionsWrapperMobile: {
      "& .FeedCardActions-root": { margin: 0 },
      "& .MuiButtonBase-root": {
         background: "transparent",
      },
      paddingRight: "4px",
   },
   mobileContentInner: {
      flexDirection: "row",
      gap: 2,
      width: "100%",
   },
})

const getActionsWrapperPositionsStyles = (dialogWidth: number) => {
   return sxStyles({
      position: "fixed",
      bottom: "10vh",
      left: `calc(50% + ${dialogWidth / 2}px + 24px)`,
      zIndex: 1301,
   })
}

type Props = {
   spark: SparkPresenter
   playing: boolean
   onClose: (event: SyntheticEvent) => void
}

export const ExpandedSparkCard = ({ spark, playing, onClose }: Props) => {
   const isMobile = useIsMobile()
   const [dialogWidth, setDialogWidth] = useState(undefined)
   const dialogRef = useRef<HTMLDivElement>(null)
   const { data: visitorId } = useFingerPrint()
   const { authenticatedUser } = useAuth()
   const { trackEvent, trackSecondsWatched } = useSparksFeedTracker()

   const companyPageLink = spark.group.publicProfile
      ? `/company/${companyNameSlugify(spark.group.universityName)}`
      : undefined

   const mentorPageLink = buildMentorPageLink({
      universityName: spark.group.universityName,
      firstName: spark.creator.firstName,
      lastName: spark.creator.lastName,
      creatorId: spark.creator.id,
   })

   const onCreatorDetailsClick = useCallback(() => {
      if (mentorPageLink) {
         trackEvent(SparkEventActions.Click_MentorPageCTA)
      }
   }, [mentorPageLink, trackEvent])

   const onVideoPlay = useCallback(() => {
      trackEvent(SparkEventActions.Played_Spark)
   }, [trackEvent])

   const onVideoEnded = useCallback(() => {
      trackEvent(SparkEventActions.Watched_CompleteSpark)
   }, [trackEvent])

   const trackEventRef = useRef(trackEvent)

   useEffect(() => {
      if (!visitorId) return

      const timeoutId = setTimeout(() => {
         sparkService
            .markSparkAsSeen(authenticatedUser?.email, spark.id)
            .catch(console.error)
         trackEventRef.current(SparkEventActions.Impression)
      }, 1000)

      return () => clearTimeout(timeoutId)
   }, [visitorId, authenticatedUser?.email, spark.id])

   useEffect(() => {
      if (!dialogRef.current) return

      const resizeObserver = new ResizeObserver((entries) => {
         const width = entries[0]?.contentRect.width
         if (width) {
            setDialogWidth(width)
         }
      })

      // Ensures the dialog is rendered before observing and setting the width
      requestAnimationFrame(() => {
         setDialogWidth(dialogRef.current?.offsetWidth)
         if (dialogRef.current) {
            resizeObserver.observe(dialogRef.current)
         }
      })

      return () => resizeObserver.disconnect()
   }, [])

   const actionsWrapperStyles = useMemo(
      () => getActionsWrapperPositionsStyles(dialogWidth ?? 0),
      [dialogWidth]
   )

   if (!visitorId) return null

   return (
      <ExpandedCard onClose={onClose} ref={dialogRef}>
         <Box sx={styles.root}>
            <Box sx={styles.cardContent}>
               <VideoPreview
                  thumbnailUrl={getResizedUrl(spark.video.thumbnailUrl, "lg")}
                  videoUrl={spark.getTransformedVideoUrl()}
                  playing={playing}
                  onSecondPassed={trackSecondsWatched}
                  onVideoPlay={onVideoPlay}
                  onVideoEnded={onVideoEnded}
                  identifier={spark?.id}
               />
               <Box sx={styles.contentInner}>
                  <Stack sx={isMobile ? styles.mobileContentInner : {}}>
                     <Stack sx={styles.sparkData}>
                        <SparkDetails
                           companyLogoUrl={getResizedUrl(
                              spark.creator.avatarUrl,
                              "md"
                           )}
                           onClick={onCreatorDetailsClick}
                           displayName={`${spark.creator.firstName} ${spark.creator.lastName}`}
                           companyName={spark.group.universityName}
                           creatorPosition={spark.creator.position}
                           linkToMentorPage={mentorPageLink}
                        />
                        <Box mt={2} />
                        <SparkCategoryChip categoryId={spark.category.id} />
                        <Box mt={1.5} />
                        <SparkQuestion question={spark.question} />
                        {Boolean(spark.hasJobs && !isMobile) && (
                           <JobButton spark={spark} />
                        )}
                     </Stack>
                     <Box
                        sx={
                           isMobile
                              ? styles.actionsWrapperMobile
                              : [
                                   actionsWrapperStyles,
                                   styles.actionsWrapperDesktop,
                                ]
                        }
                     >
                        <FeedCardActions
                           spark={spark}
                           linkToCompanyPage={companyPageLink}
                           hideActions={["filter"]}
                        />
                     </Box>
                  </Stack>
                  <Box ml="auto" />
               </Box>
               {Boolean(spark.hasJobs && isMobile) && (
                  <JobButton spark={spark} />
               )}
            </Box>
         </Box>
      </ExpandedCard>
   )
}

const JobButton = ({ spark }: { spark: SparkPresenter }) => (
   <Box sx={styles.jobButton}>
      <SuspenseWithBoundary fallback={<></>}>
         <SparkJobButton spark={spark} />
      </SuspenseWithBoundary>
   </Box>
)
