import { downloadLinkWithDate } from "@careerfairy/shared-lib/livestreams/recordings"
import PlayIcon from "@mui/icons-material/PlayCircleOutlineRounded"
import { Button } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useLiveStreamDialog } from "components/views/livestream-dialog/LivestreamDialog"
import { useRouter } from "next/router"
import { errorLogAndNotify } from "util/CommonUtil"
import { livestreamRepo } from "../../../../../../data/RepositoryInstances"
import { AnalyticsEvents } from "../../../../../../util/analyticsConstants"
import { dataLayerLivestreamEvent } from "../../../../../../util/analyticsUtils"
import { ActionButtonWrapper } from "./ActionButton"
import { useActionButtonContext } from "./ActionButtonProvider"
import styles from "./Styles"

const scrollToHero = () => {
   const element = document.getElementById("live-stream-dialog-hero")
   if (element) {
      element.scrollIntoView({
         behavior: "smooth",
         block: "start",
         inline: "end",
      })
   }
}
type WatchNowButtonProps = {
   fullWidth?: boolean
}
const WatchNowButton = ({ fullWidth }: WatchNowButtonProps) => {
   const { isLoggedIn, userData } = useAuth()
   const router = useRouter()
   const {
      isFloating,
      heroVisible,
      isFixedToBottom,
      showIcon,
      secondary,
      outlined,
      onClickWatchRecording,
      livestreamPresenter,
   } = useActionButtonContext()
   const { goToView, livestream } = useLiveStreamDialog()

   const handleWatchRecording = async () => {
      if (livestreamPresenter.isPanel) {
         // For panels, check authentication first
         if (!isLoggedIn) {
            // Redirect to login page
            router.push({
               pathname: `/login`,
               query: `absolutePath=${router.asPath}`,
            })
            return
         }

         if (isFixedToBottom) {
            if (onClickWatchRecording) {
               onClickWatchRecording()
            }
         }
         // For past panels, open recording in new tab
         try {
            const recordingToken =
               await livestreamRepo.getLivestreamRecordingTokenAndIncrementViewStat(
                  livestreamPresenter.id,
                  livestream.start,
                  userData?.userEmail
               )

            // Update user recording stats with minutesWatched >= 1 for analytics
            if (userData?.userEmail) {
               await livestreamRepo.updateUserRecordingStats({
                  livestreamId: livestreamPresenter.id,
                  livestreamStartDate: livestream.start,
                  minutesWatched: 1,
                  userId: userData.userEmail,
               })
            }

            const recordingUrl = downloadLinkWithDate(
               livestream.start.toDate(),
               livestreamPresenter.id,
               recordingToken?.sid
            )

            // Open recording in new tab
            window.open(recordingUrl, "_blank")

            // Track analytics event
            dataLayerLivestreamEvent(AnalyticsEvents.RecordingPlay, livestream)
         } catch (error) {
            errorLogAndNotify(error, {
               message: "Failed to open recording",
               livestreamId: livestreamPresenter.id,
            })
            // Fallback to default behavior if recording fails
            goToView("livestream-details")
         }
      } else {
         // For livestreams, keep original behavior
         if (isFixedToBottom) {
            if (onClickWatchRecording) {
               onClickWatchRecording()
            }
            goToView("livestream-details")
         } else {
            scrollToHero()
         }
      }
   }

   const buttonText = isFixedToBottom ? "Watch recording" : "Watch now"

   return (
      <ActionButtonWrapper
         disableMarginTop
         isFloating={isFloating}
         isFixedToBottom={isFixedToBottom}
      >
         <Button
            id="watch-now-button"
            color={secondary ? "secondary" : "primary"}
            sx={[
               styles.btn,
               heroVisible && styles.hiddenButton,
               fullWidth && styles.btnFullWidth,
            ]}
            variant={outlined ? "outlined" : "contained"}
            fullWidth
            onClick={handleWatchRecording}
            disableElevation
            endIcon={isFixedToBottom && !showIcon ? null : <PlayIcon />}
            data-testid="livestream-watch-now-button"
            size={isFixedToBottom ? "medium" : "large"}
         >
            {!isLoggedIn ? "Sign up to watch" : null}
            {isLoggedIn ? buttonText : null}
         </Button>
      </ActionButtonWrapper>
   )
}

export default WatchNowButton
