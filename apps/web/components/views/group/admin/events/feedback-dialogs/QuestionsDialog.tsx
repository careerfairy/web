import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, Button, Stack, Typography } from "@mui/material"
import { useLivestreamSWR } from "components/custom-hook/live-stream/useLivestreamSWR"
import { useAllLivestreamQuestions } from "components/custom-hook/streaming/question/useAllLivestreamQuestions"
import useIsMobile from "components/custom-hook/useIsMobile"
import { CSVDialogDownload } from "components/custom-hook/useMetaDataActions"
import useClientSidePagination from "components/custom-hook/utils/useClientSidePagination"
import { EmptyItemsView } from "components/views/common/EmptyItemsView"
import { ResponsiveDialogLayout } from "components/views/common/ResponsiveDialog"
import { SlideUpTransition } from "components/views/common/transitions"
import { Fragment } from "react"
import { DownloadCloud, Users } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { StyledPagination } from "../../common/CardCustom"
import { PollsSection } from "./PollsSection"
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
   content: {
      px: "0px !important",
   },
   questionsSection: {
      px: { xs: 1.5, md: 4 },
   },
})

const ITEMS_PER_PAGE = 7

type QuestionsDialogProps = {
   onClose: () => void
   livestreamId: string
}

export const QuestionsDialog = ({
   onClose,
   livestreamId,
}: QuestionsDialogProps) => {
   const { data: livestream, isLoading } = useLivestreamSWR(livestreamId)

   return (
      <ResponsiveDialogLayout
         open={Boolean(livestreamId)}
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
         dataTestId="livestream-questions-dialog"
      >
         {isLoading ? (
            <Loader />
         ) : livestream ? (
            <QuestionsDialogContent livestream={livestream} onClose={onClose} />
         ) : (
            <EmptyItemsView
               title={"Live stream not found"}
               description={
                  "The live stream you're looking for doesn't exist or has been deleted."
               }
               icon={<Box component={Users} color="secondary.main" size={40} />}
            />
         )}
      </ResponsiveDialogLayout>
   )
}

type QuestionsDialogContentProps = {
   livestream: LivestreamEvent
   onClose: () => void
}

const QuestionsDialogContent = ({
   livestream,
   onClose,
}: QuestionsDialogContentProps) => {
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

   const formatQuestionsForCSV = () => {
      if (!questions.length) return []

      return questions.map((question) => ({
         Question: question.title,
         Timestamp: question.timestamp?.toDate?.()?.toISOString() || "N/A",
         Votes: question.votes.toString(),
         "Number of Comments": (question.numberOfComments || 0).toString(),
      }))
   }

   return (
      <Fragment>
         <Header
            title={livestream?.title}
            start={livestream?.start?.toDate?.()}
            onClose={onClose}
         />

         <Content sx={styles.content}>
            {/* Questions Section */}
            <Box pb={4} sx={styles.questionsSection}>
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
                  ) : paginatedQuestions.length === 0 ? (
                     <Typography py={6} color="neutral.400" variant="medium">
                        No questions have been submitted for this live stream
                        yet.
                     </Typography>
                  ) : (
                     paginatedQuestions.map((question) => (
                        <QuestionCard key={question.id} question={question} />
                     ))
                  )}
               </Stack>

               {/* Desktop pagination */}
               {totalPages > 1 && (
                  <Box sx={styles.paginationContainer}>
                     <StyledPagination
                        color="secondary"
                        page={currentPage}
                        count={totalPages}
                        onChange={(_, page) => goToPage(page)}
                        siblingCount={1}
                        boundaryCount={0}
                     />
                  </Box>
               )}
            </Box>

            {/* Polls Section */}
            <PollsSection livestreamId={livestream?.id} />
         </Content>
      </Fragment>
   )
}

const Loader = () => {
   return Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
      <QuestionCardSkeleton key={index} />
   ))
}
