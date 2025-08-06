import {
   LivestreamEvent,
   LivestreamEventPublicData,
} from "@careerfairy/shared-lib/livestreams"
import { Box, Button, Stack, Typography } from "@mui/material"
import { useAllLivestreamQuestions } from "components/custom-hook/streaming/question/useAllLivestreamQuestions"
import useIsMobile from "components/custom-hook/useIsMobile"
import { CSVDialogDownload } from "components/custom-hook/useMetaDataActions"
import useClientSideInfiniteScroll from "components/custom-hook/utils/useClientSideInfiniteScroll"
import useClientSidePagination from "components/custom-hook/utils/useClientSidePagination"
import { ResponsiveDialogLayout } from "components/views/common/ResponsiveDialog"
import { SlideUpTransition } from "components/views/common/transitions"
import { DownloadCloud } from "react-feather"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { StyledPagination } from "../../common/CardCustom"
import { QuestionCard, QuestionCardSkeleton } from "./QuestionCard"
import { Content, Header } from "./common"

const styles = sxStyles({
   paginationContainer: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      mt: 3,
   },
   loadMoreTrigger: {
      height: "100px",
      width: "100%",
   },
})

type QuestionsDialogProps = {
   livestream?: LivestreamEventPublicData
   onClose?: () => void
}

const ITEMS_PER_PAGE = 7

export const QuestionsDialog = ({
   livestream,
   onClose,
}: QuestionsDialogProps) => {
   const isMobile = useIsMobile()
   const { data: questions = [], isLoading } = useAllLivestreamQuestions(
      livestream?.id
   )

   // Desktop pagination
   const {
      currentPageData: paginatedQuestions,
      currentPage,
      totalPages,
      goToPage,
   } = useClientSidePagination({
      data: questions,
      itemsPerPage: ITEMS_PER_PAGE,
   })

   // Mobile infinite scroll
   const {
      visibleData: visibleQuestions,
      hasMore,
      ref,
   } = useClientSideInfiniteScroll({
      data: questions,
      itemsPerPage: ITEMS_PER_PAGE,
   })

   const displayQuestions = isMobile ? visibleQuestions : paginatedQuestions

   const formatQuestionsForCSV = () => {
      if (!questions.length) return []

      return questions.map((question) => ({
         Question: question.title,
         Timestamp: question.timestamp
            ? DateUtil.formatFullDateWithTime(question.timestamp.toDate())
            : "N/A",
         Votes: question.votes.toString(),
         "Number of Comments": (question.numberOfComments || 0).toString(),
      }))
   }

   const formatDate = (timestamp: LivestreamEvent["start"]) => {
      if (!timestamp) return ""
      try {
         const date = timestamp.toDate()
         return DateUtil.formatFullDateWithTime(date)
      } catch (error) {
         console.error("Error formatting date", error)
         return ""
      }
   }

   return (
      <ResponsiveDialogLayout
         open={Boolean(livestream?.id)}
         handleClose={onClose}
         hideDragHandle
         dialogPaperStyles={{
            maxWidth: 1100,
         }}
         TransitionComponent={SlideUpTransition}
         SlideProps={{
            unmountOnExit: true,
         }}
         TransitionProps={{
            unmountOnExit: true,
         }}
      >
         <Header
            title={livestream?.title}
            start={formatDate(livestream?.start)}
            onClose={onClose}
         />

         <Content>
            <Box pb={4}>
               <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="space-between"
                  alignItems="center"
                  pb={{ xs: 1.5, md: 3 }}
               >
                  <Typography
                     variant={isMobile ? "medium" : "brandedH5"}
                     fontWeight="600"
                     color="neutral.800"
                  >
                     Questions
                  </Typography>
                  <CSVDialogDownload
                     title="Download Questions"
                     data={formatQuestionsForCSV()}
                     filename={`Questions ${
                        livestream?.title || livestream?.id
                     } ${new Date().toISOString().split("T")[0]}.csv`}
                  >
                     <Button
                        variant="outlined"
                        color="grey"
                        size="small"
                        startIcon={<DownloadCloud size={16} />}
                     >
                        {isMobile ? "Download" : "Download questions"}
                     </Button>
                  </CSVDialogDownload>
               </Stack>

               <Stack spacing={isMobile ? 0.75 : 1.5}>
                  {isLoading || !livestream ? (
                     <Loader />
                  ) : displayQuestions.length === 0 ? (
                     <Typography py={6} color="neutral.400" variant="medium">
                        No questions have been submitted for this event yet.
                     </Typography>
                  ) : (
                     displayQuestions.map((question) => (
                        <QuestionCard key={question.id} question={question} />
                     ))
                  )}

                  {/* Mobile infinite scroll trigger */}
                  {Boolean(isMobile && hasMore) && (
                     <Box ref={ref} sx={styles.loadMoreTrigger} />
                  )}
               </Stack>

               {/* Desktop pagination */}
               {!isMobile && totalPages > 1 && (
                  <Box sx={styles.paginationContainer}>
                     <StyledPagination
                        color="secondary"
                        page={currentPage}
                        count={totalPages}
                        onChange={(_, page) => goToPage(page)}
                        siblingCount={1}
                        boundaryCount={1}
                     />
                  </Box>
               )}
            </Box>
         </Content>
      </ResponsiveDialogLayout>
   )
}

const Loader = () => {
   return Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
      <QuestionCardSkeleton key={index} />
   ))
}
