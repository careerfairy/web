import React, { FC, useMemo } from "react"
import { Dialog, DialogContent, Slide } from "@mui/material"
import useGroupLivestreamStat from "../../../../../../custom-hook/live-stream/useGroupLivestreamStat"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { useFeedbackPageContext } from "../FeedbackPageProvider"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"
import Title from "./Title"
import { OverviewContent, OverviewTitle } from "./Overview"
import SwipeableViews from "react-swipeable-views"
import { FeedbackAnswersContent, FeedbackAnswersTitle } from "./FeedbackAnswers"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { AnimatedTabPanel } from "../../../../../../../materialUI/GlobalPanels/GlobalPanels"

const styles = sxStyles({
   content: {
      px: {
         mobile: 4.75,
      },
      transition: (theme) => theme.transitions.create("all"),
   },
})

type Props = {
   livestreamId: string
   feedbackQuestionId?: string
}

const overviewKey = 0
const feedbackAnswersKey = 1

type Value =
   | typeof overviewKey // Overview
   | typeof feedbackAnswersKey // Feedback

const FeedbackDialog: FC<Props> = ({ livestreamId, feedbackQuestionId }) => {
   const { handleCloseFeedbackDialog } = useFeedbackPageContext()
   const { group } = useGroup()
   const isMobile = useIsMobile()

   const { data: stats } = useGroupLivestreamStat(group.id, livestreamId)

   const value = useMemo<Value>(() => {
      if (feedbackQuestionId) {
         return feedbackAnswersKey
      }
      return overviewKey
   }, [feedbackQuestionId])

   const livestreamStats = stats?.[0]

   return (
      <Dialog
         open={Boolean(livestreamStats)}
         onClose={handleCloseFeedbackDialog}
         TransitionComponent={Slide}
         maxWidth="lg"
         fullWidth
         PaperProps={{
            sx: {
               transition: (theme) => theme.transitions.create("all"),
            },
         }}
         fullScreen={isMobile}
      >
         <Title id="feedback-dialog-title" onClose={handleCloseFeedbackDialog}>
            <SwipeableViews index={value}>
               <AnimatedTabPanel
                  key={overviewKey}
                  value={overviewKey}
                  activeValue={value}
               >
                  <OverviewTitle
                     groupId={group.id}
                     livestreamStats={livestreamStats}
                  />
               </AnimatedTabPanel>
               <AnimatedTabPanel
                  key={feedbackAnswersKey}
                  value={feedbackAnswersKey}
                  activeValue={value}
               >
                  <FeedbackAnswersTitle
                     livestreamStats={livestreamStats}
                     groupId={group.id}
                  />
               </AnimatedTabPanel>
            </SwipeableViews>
         </Title>
         <DialogContent sx={styles.content} dividers>
            <SwipeableViews index={value}>
               <AnimatedTabPanel
                  key={overviewKey}
                  value={overviewKey}
                  activeValue={value}
               >
                  <OverviewContent
                     groupId={group.id}
                     livestreamStats={livestreamStats}
                  />
               </AnimatedTabPanel>
               <AnimatedTabPanel
                  key={feedbackAnswersKey}
                  value={feedbackAnswersKey}
                  activeValue={value}
               >
                  <FeedbackAnswersContent
                     groupId={group.id}
                     livestreamStats={livestreamStats}
                  />
               </AnimatedTabPanel>
            </SwipeableViews>
         </DialogContent>
      </Dialog>
   )
}

export default FeedbackDialog
