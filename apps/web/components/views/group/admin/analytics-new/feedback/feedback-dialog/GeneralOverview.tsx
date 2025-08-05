import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { Box, Typography } from "@mui/material"
import Collapse from "@mui/material/Collapse"
import Stack from "@mui/material/Stack"
import { sxStyles } from "../../../../../../../types/commonTypes"
import DateUtil from "../../../../../../../util/DateUtil"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"
import { SuspenseWithBoundary } from "../../../../../../ErrorBoundary"
import { getMaxLineStyles } from "../../../../../../helperFunctions/HelperFunctions"
import ExportPdfButton from "../../../common/ExportPDFButton"
import { CardVotesSectionSkeleton } from "./CardVotes"
import GroupQuestions from "./GroupQuestions"
import Polls from "./Polls"
import Questions from "./Questions"
import Ratings, { RatingsSkeleton } from "./Ratings"

const styles = sxStyles({
   time: {
      ...getMaxLineStyles(1),
      fontSize: "1.07rem",
   },
   title: {
      fontWeight: 600,
      ...getMaxLineStyles(2),
   },
   exportButton: {
      whiteSpace: "nowrap",
   },
   buttonWrapper: {
      display: "flex",
      alignItems: "flex-end",
   },
})

type OverviewContentProps = {
   livestreamStats: LiveStreamStats
   onRatingQuestionClick?: (ratingId: string) => void
}

export const GeneralOverviewContent = ({
   livestreamStats,
   onRatingQuestionClick,
}: OverviewContentProps) => {
   return (
      <Collapse in={true} timeout={500}>
         <Stack spacing={3}>
            <SuspenseWithBoundary fallback={<RatingsSkeleton />}>
               <Ratings
                  livestreamStats={livestreamStats}
                  onRatingQuestionClick={onRatingQuestionClick}
               />
            </SuspenseWithBoundary>
            <Questions livestreamStats={livestreamStats} />

            <SuspenseWithBoundary fallback={<CardVotesSectionSkeleton />}>
               <GroupQuestions />
            </SuspenseWithBoundary>

            <SuspenseWithBoundary fallback={<CardVotesSectionSkeleton />}>
               <Polls livestreamStats={livestreamStats} />
            </SuspenseWithBoundary>
         </Stack>
      </Collapse>
   )
}

type OverviewTitleProps = {
   livestreamStats: LiveStreamStats
   groupId: string
}
export const GeneralOverviewTitle = ({
   livestreamStats,
   groupId,
}: OverviewTitleProps) => {
   const isMobile = useIsMobile()

   const title = (
      <Typography
         sx={styles.title}
         whiteSpace="pre-line"
         variant={isMobile ? "h5" : "h4"}
      >
         {livestreamStats.livestream.title}
      </Typography>
   )

   const time = (
      <Typography sx={styles.time} color="text.secondary">
         {DateUtil.dateWithYear(livestreamStats.livestream.start.toDate())}
      </Typography>
   )

   return (
      <Stack direction="row" justifyContent="space-between" spacing={1}>
         <Box>
            {isMobile ? (
               <>
                  {title}
                  {time}
               </>
            ) : (
               <>
                  {time}
                  {title}
               </>
            )}
         </Box>
         <Box sx={styles.buttonWrapper}>
            <ExportPdfButton
               livestreamId={livestreamStats.livestream.id}
               size={isMobile ? "small" : "medium"}
               groupId={groupId}
               sx={styles.exportButton}
            >
               {isMobile ? "EXPORT" : "EXPORT RESULTS"}
            </ExportPdfButton>
         </Box>
      </Stack>
   )
}
