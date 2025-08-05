import {
   LivestreamEvent,
   LivestreamEventPublicData,
} from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   Button,
   iconButtonClasses,
   Stack,
   Typography,
} from "@mui/material"
import { useAllLivestreamQuestions } from "components/custom-hook/streaming/question/useAllLivestreamQuestions"
import useIsMobile from "components/custom-hook/useIsMobile"
import { CSVDialogDownload } from "components/custom-hook/useMetaDataActions"
import useClientSideInfiniteScroll from "components/custom-hook/utils/useClientSideInfiniteScroll"
import useClientSidePagination from "components/custom-hook/utils/useClientSidePagination"
import { ResponsiveDialogLayout } from "components/views/common/ResponsiveDialog"
import { DownloadCloud } from "react-feather"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { StyledPagination } from "../../common/CardCustom"
import { QuestionCard } from "./QuestionCard"

const styles = sxStyles({
   content: {
      display: "flex",
      flexDirection: "column",
      px: { xs: 1.5, md: 4 },
   },
   questionsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
   paginationContainer: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      mt: 3,
      pb: 4,
   },
   loadMoreTrigger: {
      height: "100px",
      width: "100%",
   },
   emptyState: {
      py: 6,
   },
})

type QuestionsDialogProps = {
   livestreamId: string | null
   livestream?: LivestreamEventPublicData
   onClose?: () => void
}

const ITEMS_PER_PAGE = 7

export const QuestionsDialog = ({
   livestreamId,
   livestream,
   onClose,
}: QuestionsDialogProps) => {
   const isMobile = useIsMobile()
   const { data: questions = [] } = useAllLivestreamQuestions(livestreamId)

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
         Type: question.type,
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

   const closeIconPadding = isMobile ? 12 : 16

   return (
      <ResponsiveDialogLayout
         open={Boolean(livestreamId)}
         handleClose={onClose}
         hideDragHandle
         dialogPaperStyles={{
            maxWidth: 1100,
         }}
      >
         <ResponsiveDialogLayout.Header
            sx={{
               px: { xs: 1.5, md: 4 },
               pt: { xs: 1.5, md: 4 },
               position: "relative",
               [`& .${iconButtonClasses.root}`]: {
                  position: "absolute",
                  top: closeIconPadding,
                  right: closeIconPadding,
               },
            }}
            handleClose={onClose}
         >
            <Stack spacing={0.5}>
               <Typography variant="small" color="neutral.400">
                  {formatDate(livestream?.start)}
               </Typography>
               <Typography
                  color="neutral.800"
                  variant={isMobile ? "brandedH4" : "brandedH3"}
                  fontWeight={isMobile ? "700" : "600"}
               >
                  {livestream?.title}
               </Typography>
            </Stack>
         </ResponsiveDialogLayout.Header>

         <ResponsiveDialogLayout.Content>
            <Box sx={styles.content}>
               <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="space-between"
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
                        livestream?.title || livestreamId
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
                  {displayQuestions.length === 0 ? (
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
         </ResponsiveDialogLayout.Content>
      </ResponsiveDialogLayout>
   )
}
