import Stack from "@mui/material/Stack"
import React, { FC } from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import useLivestreamRatingVoters from "./useLivestreamRatingVoters"
import useLivestreamRating from "./useLivestreamRating"
import { Divider, Skeleton, Typography } from "@mui/material"
import { StyledRating } from "../../../common/inputs"
import { normalizeRating } from "@careerfairy/shared-lib/livestreams/ratings"

type FeedbackAnswersContentProps = {
   livestreamStats: LiveStreamStats
   feedbackQuestionId: string
}
export const RatingAnswers: FC<FeedbackAnswersContentProps> = ({
   livestreamStats,
   feedbackQuestionId,
}) => {
   const { data: feedbackQuestion } = useLivestreamRating(
      livestreamStats.livestream.id,
      feedbackQuestionId
   )

   const { data: voters } = useLivestreamRatingVoters(
      livestreamStats.livestream.id,
      feedbackQuestionId,
      feedbackQuestion.hasText
   )

   return (
      <Stack divider={<Divider flexItem />} spacing={3}>
         {voters.map((voter) => (
            <Stack spacing={2} key={voter.id}>
               <Stack
                  direction={{
                     xs: "column",
                     sm: "row",
                  }}
                  justifyContent="space-between"
                  spacing={1}
               >
                  <Typography fontWeight={600} variant="body1">
                     {voter.id}
                  </Typography>
                  <StyledRating
                     value={normalizeRating(feedbackQuestion, voter)}
                     readOnly
                     color="primary.main"
                  />
               </Stack>
               {voter.message ? (
                  <Typography variant="body2">{voter.message}</Typography>
               ) : null}
            </Stack>
         ))}
      </Stack>
   )
}

export const RatingAnswersSkeleton: FC = () => {
   return (
      <Stack divider={<Divider flexItem />} spacing={3}>
         {Array.from({ length: 10 }).map((_, idx) => (
            <Stack spacing={2} key={idx}>
               <Stack
                  direction={{
                     xs: "column",
                     sm: "row",
                  }}
                  justifyContent="space-between"
                  spacing={1}
               >
                  <Typography fontWeight={600} variant="body1">
                     <Skeleton variant="text" width={100} />
                  </Typography>
                  <StyledRating value={5} readOnly color="grey.500" />
               </Stack>
               <Typography variant="body2">
                  <Skeleton
                     variant="text"
                     width={`calc(100% * ${Math.random() * (1 - 0.5) + 0.5})`}
                  />
               </Typography>
            </Stack>
         ))}
      </Stack>
   )
}

export default RatingAnswers
