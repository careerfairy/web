import { Box, Stack, Typography } from "@mui/material"
import { ThumbsUp } from "react-feather"
import { sxStyles } from "types/commonTypes"
import CardCustom from "../../common/CardCustom"
import { useTopCommunityQuestions } from "components/custom-hook/group/useTopCommunityQuestions"
import { useGroup } from "layouts/GroupDashboardLayout"
import DateUtil from "util/DateUtil"

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
   container: {
      p: "16px", // Explicitly set to 16px
   },
   questionsScrollContainer: (theme) => ({
      // Desktop only: enable scrolling when content overflows
      [theme.breakpoints.up("desktop")]: {
         overflowY: "auto",
         flex: 1,
         minHeight: 0, // Allow flex child to shrink
      },
   }),
   questionCard: (theme) => ({
      border: `1px solid ${theme.brand.white[500]}`,
      backgroundColor: theme.brand.white[300], // Updated background color
      borderRadius: "12px",
      p: 1.5,
      mb: 1, // 8px margin between cards
   }),
   questionText: {
      wordBreak: "break-word",
      whiteSpace: "pre-line",
      color: "neutral.800", // Updated text color
   },
   likesContainer: {
      display: "flex",
      alignItems: "center",
      gap: 1,
   },
   likesText: {
      color: "neutral.600", // Updated likes text color
      fontSize: "14px",
   },
   timeText: {
      color: "neutral.600", // Updated time color
      fontSize: "12px",
   },
   icon: {
      width: 14,
      height: 14,
      color: "neutral.600", // Updated icon color
   },
   emptyState: {
      textAlign: "center",
      py: 4,
   },
   emptyCard: (theme) => ({
      border: `1px solid ${theme.brand.white[500]}`,
      backgroundColor: theme.brand.white[300],
      borderRadius: "12px",
      p: 1.5,
      textAlign: "center",
   }),
   emptyTitle: {
      color: "neutral.800",
      fontWeight: 500,
      mb: 1,
   },
   emptyText: {
      color: "neutral.600",
      fontSize: "14px",
   },
})

export const TopCommunityQuestionsCard = () => {
   const { group } = useGroup()
   const { data: questions, isLoading, error } = useTopCommunityQuestions(group.id)

   const renderContent = () => {
      if (isLoading) {
         return (
            <Box sx={styles.container}>
               <Typography variant="medium" color="text.secondary">
                  Loading questions...
               </Typography>
            </Box>
         )
      }

      if (error) {
         return (
            <Box sx={styles.container}>
               <Typography variant="medium" color="error.main">
                  Failed to load questions
               </Typography>
            </Box>
         )
      }

      if (!questions || questions.length === 0) {
         return (
            <Box sx={styles.container}>
               <Box sx={styles.emptyCard}>
                  <Typography variant="medium" sx={styles.emptyTitle}>
                     No questions yet
                  </Typography>
                  <Typography sx={styles.emptyText}>
                     Your top questions will appear here once you publish a live stream and your community starts asking.
                  </Typography>
               </Box>
            </Box>
         )
      }

      return (
         <Box sx={styles.container}>
            <Box sx={styles.questionsScrollContainer}>
               <Stack spacing={1}>
                  {questions.map((question, index) => (
                     <Box key={`${question.id}-${index}`} sx={styles.questionCard}>
                        <Typography variant="medium" sx={styles.questionText}>
                           {question.title}
                        </Typography>
                        
                        <Stack 
                           direction="row" 
                           justifyContent="space-between" 
                           alignItems="center" 
                           mt={1}
                        >
                           <Box sx={styles.likesContainer}>
                              <ThumbsUp style={styles.icon} />
                              <Typography sx={styles.likesText}>
                                 {question.votes || 0} likes
                              </Typography>
                           </Box>
                           
                           {question.timestamp && (
                              <Typography sx={styles.timeText}>
                                 {DateUtil.getTimeAgo(question.timestamp.toDate())}
                              </Typography>
                           )}
                        </Stack>
                     </Box>
                  ))}
               </Stack>
            </Box>
         </Box>
      )
   }

   return (
      <CardCustom title="Top community questions" sx={styles.cardContainer}>
         {renderContent()}
      </CardCustom>
   )
}