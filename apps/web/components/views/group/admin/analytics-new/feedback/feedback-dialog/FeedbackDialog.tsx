import { Dialog, DialogContent } from "@mui/material"
import { useMemo } from "react"
import SwipeableViews from "react-swipeable-views"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { AnimatedTabPanel } from "../../../../../../../materialUI/GlobalPanels/GlobalPanels"
import { sxStyles } from "../../../../../../../types/commonTypes"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"

import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { useListenToDocument } from "components/custom-hook/useListenToDocument"
import { SlideUpTransition } from "components/views/common/transitions"
import { useFeedbackDialogContext } from "./FeedbackDialogProvider"
import { GeneralOverviewContent, GeneralOverviewTitle } from "./GeneralOverview"
import { RatingOverviewContent, RatingOverviewTitle } from "./RatingOverview"
import Title from "./Title"

const styles = sxStyles({
   content: {
      px: {
         mobile: 4.75,
      },
   },
   paper: {
      maxWidth: 996,
   },
})

const generalOverviewKey = 0
const ratingOverviewKey = 1

type Value = typeof generalOverviewKey | typeof ratingOverviewKey

const FeedbackDialog = () => {
   const {
      livestreamId,
      feedbackQuestionId,
      onRatingQuestionClick,
      onBackToFeedback,
      onCloseFeedbackDialog,
   } = useFeedbackDialogContext()

   const { group } = useGroup()
   const isMobile = useIsMobile()

   const { data: livestreamStats } = useListenToDocument<LiveStreamStats>(
      livestreamId ? `livestreams/${livestreamId}/stats/livestreamStats` : null
   )

   const value = useMemo<Value>(() => {
      if (feedbackQuestionId) {
         return ratingOverviewKey
      }
      return generalOverviewKey
   }, [feedbackQuestionId])

   return (
      <Dialog
         open={Boolean(livestreamStats)}
         onClose={onCloseFeedbackDialog}
         TransitionComponent={SlideUpTransition}
         maxWidth="lg"
         fullWidth
         fullScreen={isMobile}
         PaperProps={{
            sx: styles.paper,
         }}
         TransitionProps={{
            unmountOnExit: true,
         }}
      >
         <Title id="feedback-dialog-title" onClose={onCloseFeedbackDialog}>
            <SwipeableViews index={value}>
               <AnimatedTabPanel
                  key={generalOverviewKey}
                  value={generalOverviewKey}
                  activeValue={value}
               >
                  <GeneralOverviewTitle
                     groupId={group.id}
                     livestreamStats={livestreamStats}
                  />
               </AnimatedTabPanel>
               <AnimatedTabPanel
                  key={ratingOverviewKey}
                  value={ratingOverviewKey}
                  activeValue={value}
               >
                  <RatingOverviewTitle
                     livestreamStats={livestreamStats}
                     feedbackQuestionId={feedbackQuestionId}
                     onBackToFeedback={onBackToFeedback}
                  />
               </AnimatedTabPanel>
            </SwipeableViews>
         </Title>
         <DialogContent sx={styles.content} dividers>
            <SwipeableViews index={value}>
               <AnimatedTabPanel
                  key={generalOverviewKey}
                  value={generalOverviewKey}
                  activeValue={value}
               >
                  <GeneralOverviewContent
                     livestreamStats={livestreamStats}
                     onRatingQuestionClick={onRatingQuestionClick}
                  />
               </AnimatedTabPanel>
               <AnimatedTabPanel
                  key={ratingOverviewKey}
                  value={ratingOverviewKey}
                  activeValue={value}
               >
                  <RatingOverviewContent
                     livestreamStats={livestreamStats}
                     feedbackQuestionId={feedbackQuestionId}
                  />
               </AnimatedTabPanel>
            </SwipeableViews>
         </DialogContent>
      </Dialog>
   )
}

export default FeedbackDialog
