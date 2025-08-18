import ThumbUpIcon from "@mui/icons-material/ThumbUpOffAlt"
import { Box, Stack, Typography } from "@mui/material"
import { alpha } from "@mui/material/styles"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { TopCommunityQuestion } from "components/custom-hook/live-stream/useTopCommunityQuestions"

const styles = sxStyles({
   questionItem: {
      borderRadius: 2.5,
      p: [1.5, 1.625],
      bgcolor: (theme) => theme.brand.white[300],
      height: "100%",
      justifyContent: "space-between",
   },
   buttonsWrapper: {
      alignItems: "center",
      justifyContent: "space-between",
      display: "flex",
   },
   likesDisplay: {
      textTransform: "none",
      p: 0,
      color: "neutral.600",
      "& svg": {
         width: "18px",
         height: "18px",
      },
      "& span": {
         mr: 0.8,
      },
      fontSize: "0.875rem",
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 0.8,
   },
   date: {
      fontSize: "0.857rem",
      color: "neutral.600",
      fontWeight: 400,
   },
})

type Props = {
   question: TopCommunityQuestion
}

export const TopCommunityQuestionCard: FC<Props> = ({ question }) => {
   return (
      <Stack sx={styles.questionItem} spacing={2.7}>
         <Typography variant="brandedBody" color="neutral.800">{question.title}</Typography>
         <Box sx={styles.buttonsWrapper}>
            <Box sx={styles.likesDisplay}>
               <ThumbUpIcon />
               <span>{`${question.votes || 0} likes`}</span>
            </Box>
            <Typography sx={styles.date}>
               {DateUtil.getTimeAgo(question.timestamp?.toDate() ?? new Date())}
            </Typography>
         </Box>
      </Stack>
   )
}
