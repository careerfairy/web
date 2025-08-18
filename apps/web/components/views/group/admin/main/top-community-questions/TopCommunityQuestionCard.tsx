import ThumbUpIcon from "@mui/icons-material/ThumbUpOffAlt"
import { Box, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import { alpha } from "@mui/material/styles"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { TopCommunityQuestion } from "components/custom-hook/live-stream/useTopCommunityQuestions"

const styles = sxStyles({
   questionItem: {
      borderRadius: 2.5,
      border: "1px solid",
      borderColor: "#E1E1E1",
      p: [1.5, 1.625],
      bgcolor: "background.paper",
      height: "100%",
      justifyContent: "space-between",
   },
   buttonsWrapper: {
      alignItems: "center",
      justifyContent: "space-between",
      display: "flex",
   },
   likesContainer: {
      display: "flex",
      alignItems: "center",
      gap: 0.8,
      color: "neutral.400",
   },
   likesIcon: {
      width: "18px",
      height: "18px",
   },
   likesText: {
      fontSize: "0.875rem",
      fontWeight: 400,
   },
   date: {
      fontSize: "0.857rem",
      color: (theme) => `${alpha(theme.palette.text.secondary, 0.4)}`,
      fontWeight: 400,
   },
})

type Props = {
   question: TopCommunityQuestion
}

export const TopCommunityQuestionCard: FC<Props> = ({ question }) => {
   return (
      <Stack sx={styles.questionItem} spacing={2.7}>
         <Typography>{question.title}</Typography>
         <Box sx={styles.buttonsWrapper}>
            <Box sx={styles.likesContainer}>
               <ThumbUpIcon sx={styles.likesIcon} />
               <Typography sx={styles.likesText}>
                  {`${question.votes || 0} likes`}
               </Typography>
            </Box>
            <Typography sx={styles.date}>
               {DateUtil.getTimeAgo(question.timestamp?.toDate() ?? new Date())}
            </Typography>
         </Box>
      </Stack>
   )
}