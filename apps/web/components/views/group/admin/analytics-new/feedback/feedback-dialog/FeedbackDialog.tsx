import React, { FC, useMemo } from "react"
import { Dialog, DialogContent, Slide } from "@mui/material"
import useGroupLivestreamStat from "../../../../../../custom-hook/live-stream/useGroupLivestreamStat"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { useFeedbackPageContext } from "../FeedbackPageProvider"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"
import Title from "./Title"
import { GeneralOverviewContent, GeneralOverviewTitle } from "./GeneralOverview"
import SwipeableViews from "react-swipeable-views"
import { RatingOverviewContent, RatingOverviewTitle } from "./RatingOverview"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { AnimatedTabPanel } from "../../../../../../../materialUI/GlobalPanels/GlobalPanels"

const styles = sxStyles({
   content: {
      px: {
         mobile: 4.75,
      },
   },
})

type Props = {
   livestreamId: string
   feedbackQuestionId?: string
}

const generalOverviewKey = 0
const ratingOverviewKey = 1

type Value = typeof generalOverviewKey | typeof ratingOverviewKey

const FeedbackDialog: FC<Props> = ({ livestreamId, feedbackQuestionId }) => {
   const { handleCloseFeedbackDialog } = useFeedbackPageContext()
   const { group } = useGroup()
   const isMobile = useIsMobile()

   const { data: stats } = useGroupLivestreamStat(group.id, livestreamId)

   const value = useMemo<Value>(() => {
      if (feedbackQuestionId) {
         return ratingOverviewKey
      }
      return generalOverviewKey
   }, [feedbackQuestionId])

   const livestreamStats = stats?.[0]

   return (
      <Dialog
         open={Boolean(livestreamStats)}
         onClose={handleCloseFeedbackDialog}
         TransitionComponent={Slide}
         maxWidth="lg"
         fullWidth
         fullScreen={isMobile}
      >
         <Title id="feedback-dialog-title" onClose={handleCloseFeedbackDialog}>
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
                     groupId={group.id}
                     feedbackQuestionId={feedbackQuestionId}
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
                     groupId={group.id}
                     livestreamStats={livestreamStats}
                  />
               </AnimatedTabPanel>
               <AnimatedTabPanel
                  key={ratingOverviewKey}
                  value={ratingOverviewKey}
                  activeValue={value}
               >
                  <RatingOverviewContent
                     groupId={group.id}
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
