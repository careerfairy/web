import { Box, Grid, Typography } from "@mui/material"
import { useGroup } from "layouts/GroupDashboardLayout"
import { sxStyles } from "types/commonTypes"
import CardCustom from "../../common/CardCustom"
import { useTopCommunityQuestions } from "components/custom-hook/live-stream/useTopCommunityQuestions"
import { TopCommunityQuestionCard } from "./TopCommunityQuestionCard"

const styles = sxStyles({
   questionsContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 1, // 8px between cards as specified
   },
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
      minHeight: "200px",
   },
   noQuestionsCopyContainer: {
      maxWidth: "490px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
   },
   noQuestionsTitle: {
      fontWeight: 600,
      color: "neutral.800",
   },
   noQuestionsText: {
      fontWeight: 400,
      color: "neutral.700",
   },
})

export const TopCommunityQuestionsCard = () => {
   const { group } = useGroup()
   const { data: topQuestions = [], error, isLoading } = useTopCommunityQuestions(group?.id)

   const hasQuestions = topQuestions.length > 0

   return (
      <CardCustom title="Top community questions">
         <Box pt={2}> {/* 16px padding between title and content as specified */}
            {hasQuestions ? (
               <Box sx={styles.questionsContainer}>
                  {topQuestions.map((question) => (
                     <TopCommunityQuestionCard
                        key={question.id}
                        question={question}
                     />
                  ))}
               </Box>
            ) : (
               <Box sx={styles.noQuestionsContainer}>
                  <Box sx={styles.noQuestionsCopyContainer}>
                     <Typography
                        variant="brandedH5"
                        sx={styles.noQuestionsTitle}
                     >
                        No questions yet
                     </Typography>
                     <Typography
                        variant="brandedBody"
                        sx={styles.noQuestionsText}
                     >
                        Your top questions will appear here once you publish a live stream and your community starts asking.
                     </Typography>
                  </Box>
               </Box>
            )}
         </Box>
      </CardCustom>
   )
}