import { Box, Typography } from "@mui/material"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useTopCommunityQuestions } from "components/custom-hook/live-stream/useTopCommunityQuestions"
import CardCustom from "../../common/CardCustom"
import { TopCommunityQuestionCard } from "./TopCommunityQuestionCard"

const styles = sxStyles({
   cardContainer: (theme) => ({
      // Desktop only: max-height for the entire tile
      [theme.breakpoints.up("desktop")]: {
         maxHeight: "400px",
         display: "flex",
         flexDirection: "column",
         overflow: "hidden",
      },
   }),
   questionsContainer: (theme) => ({
      display: "flex",
      flexDirection: "column",
      gap: 1,
      flex: 1,
      // Desktop only: enable scrolling when content overflows
      [theme.breakpoints.up("desktop")]: {
         overflowY: "auto",
         minHeight: 0, // Allow flex child to shrink
      },
   }),
   noQuestionsContainer: {
      backgroundColor: (theme) => theme.brand.white[200],
      borderRadius: "8px",
      border: "1px solid",
      borderColor: (theme) => theme.brand.white[500],
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "16px",
      textAlign: "center",
      padding: "20px 12px",
      flex: "1 1",
      minHeight: { xs: "200px", md: "250px" },
   },
   questionIcon: {
      width: "44px",
      height: "44px",
   },
   noQuestionsCopy: {
      fontWeight: 600,
      color: "neutral.800",
   },
   noQuestionsCopy2: {
      fontWeight: 400,
      color: "neutral.700",
   },
   noQuestionsCopyContainer: {
      maxWidth: "490px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
   },
})

export const TopCommunityQuestionsCard: FC = () => {
   const { group } = useGroup()
   const {
      data: topQuestions,
      isLoading,
      error,
   } = useTopCommunityQuestions(group?.id || "")

   const hasQuestions = topQuestions && topQuestions.length > 0

   return (
      <CardCustom title="Top community questions" sx={styles.cardContainer}>
         {error ? (
            <Box sx={styles.noQuestionsContainer}>
               <Box gap="8px" sx={styles.noQuestionsCopyContainer}>
                  <Typography variant="brandedH5" sx={styles.noQuestionsCopy}>
                     Unable to load questions
                  </Typography>
                  <Typography
                     variant="brandedBody"
                     sx={styles.noQuestionsCopy2}
                  >
                     Please try refreshing the page.
                  </Typography>
               </Box>
            </Box>
         ) : hasQuestions ? (
            <Box sx={styles.questionsContainer}>
               {topQuestions.map((question) => (
                  <TopCommunityQuestionCard
                     key={question.id}
                     question={question}
                  />
               ))}
            </Box>
         ) : isLoading ? (
            <Box sx={styles.questionsContainer}>
               {/* Loading state - show skeleton cards */}
               {Array.from({ length: 3 }).map((_, index) => (
                  <Box
                     key={index}
                     sx={{
                        borderColor: "#E1E1E1",
                        borderRadius: 2.5,
                        border: "1px solid",
                        p: [1.5, 1.625],
                        bgcolor: "background.paper",
                        height: "80px",
                        opacity: 0.6,
                     }}
                  />
               ))}
            </Box>
         ) : (
            <Box sx={styles.noQuestionsContainer}>
               <Box gap="8px" sx={styles.noQuestionsCopyContainer}>
                  <Typography variant="brandedH5" sx={styles.noQuestionsCopy}>
                     No questions yet
                  </Typography>
                  <Typography
                     variant="brandedBody"
                     sx={styles.noQuestionsCopy2}
                  >
                     Your top questions will appear here once you publish a live
                     stream and your community starts asking.
                  </Typography>
               </Box>
            </Box>
         )}
      </CardCustom>
   )
}
