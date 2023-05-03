import Stack from "@mui/material/Stack"
import React, { FC } from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import useLivestreamRatingVoters from "./useLivestreamRatingVoters"
import useLivestreamRating from "./useLivestreamRating"
import { Divider, Skeleton, Typography } from "@mui/material"
import { StyledRating } from "../../../common/inputs"
import { normalizeRating } from "@careerfairy/shared-lib/livestreams/ratings"
import censorEmail from "../../../../../../util/censorEmail"

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
            <>
               <Stack spacing={2} key={voter.id}>
                  <Stack
                     direction="row"
                     justifyContent="space-between"
                     spacing={1}
                  >
                     <Typography fontWeight={600} variant="body1">
                        {censorEmail(voter.id)}
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
               {voter.id === voters[voters.length - 1].id ? (
                  <Divider flexItem />
               ) : null}
            </>
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
                  <Skeleton variant="text" width={"90%"} />
               </Typography>
            </Stack>
         ))}
      </Stack>
   )
}

export default RatingAnswers
