import { FeedbackQuestionUserAnswer } from "@careerfairy/shared-lib/livestreams"
import { Rating, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import { IconContainerProps, RatingProps } from "@mui/material/Rating"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   ratingWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      alignSelf: "stretch",
      gap: "8px",
      "& .MuiRating-root": {
         display: "flex",
         alignItems: "flex-start",
         alignSelf: "stretch",
         gap: "12px",
      },
      "& .MuiRating-icon": (theme) => ({
         display: "flex",
         flexDirection: "column",
         justifyContent: "center",
         alignItems: "center",
         flex: "1 0 0",
         borderRadius: "4px",
         padding: "8.5px 14px",
         alignSelf: "stretch",
         fontSize: "14px",
         lineHeight: "150%" /* 21px */,
         color: theme.palette.neutral[600],
         background: theme.brand.black[400],
      }),
      "& .MuiRating-iconHover": {
         color: "white",
         background: (theme) => theme.palette.primary.main,
         transform: "none",
         transition: "none",
      },
      "& .MuiRating-label": {
         display: "none",
      },
      "& label": {
         display: "flex",
         flexDirection: "column",
         justifyContent: "center",
         alignItems: "center",
         flex: "1 0 0",
      },
   },
   subText: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      alignSelf: "stretch",
      color: (theme) => theme.palette.neutral[700],
      fontWeight: 400,
   },
})

type RatingQuestionProps = RatingProps & {
   questionId: string
   onAnswerSubmit: (answer: FeedbackQuestionUserAnswer) => void
}

const RatingQuestion = ({
   questionId,
   onAnswerSubmit,
   readOnly,
   value,
   ...props
}: RatingQuestionProps) => {
   return (
      <Box sx={styles.ratingWrapper}>
         <Rating
            name={questionId}
            value={Number(value)}
            readOnly={readOnly}
            max={5}
            onChange={(_event, value: number) => {
               onAnswerSubmit({ rating: value })
            }}
            IconContainerComponent={ButtonContainer}
            {...props}
         />
         <Box sx={styles.subText}>
            <Typography variant="small">Not satisfied</Typography>
            <Typography variant="small">Very satisfied</Typography>
         </Box>
      </Box>
   )
}

const ButtonContainer = ({ value, ...props }: IconContainerProps) => {
   return <span {...props}>{value}</span>
}

export default RatingQuestion
