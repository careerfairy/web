import Stack from "@mui/material/Stack"
import LinearProgress, {
   linearProgressClasses,
} from "@mui/material/LinearProgress"
import { Box, Grid, Typography } from "@mui/material"
import { alpha } from "@mui/material/styles"
import { FC, useMemo } from "react"
import { LivestreamGroupQuestion } from "@careerfairy/shared-lib/livestreams"
import { collection, query, QueryConstraint, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../../../data/firebase/FirebaseInstance"
import useCountQuery from "../../../../../../custom-hook/useCountQuery"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import useLivestream from "../../../../../../custom-hook/live-stream/useLivestream"
import { useFeedbackPageContext } from "../FeedbackPageProvider"
import { LivestreamPresenter } from "@careerfairy/shared-lib/src/livestreams/LivestreamPresenter"
import { CardVotersSkeleton, cardVotesStyles } from "./Polls"
import { GroupQuestionOption } from "@careerfairy/shared-lib/src/groups"
import { sxStyles } from "../../../../../../../types/commonTypes"

const styles = sxStyles({
   entryRoot: {
      border: (theme) =>
         `1px solid ${alpha(theme.palette.primary.main, 0.3)} !important`,
   },
   optionProgress: {
      border: `1px solid #E3F8F5 !important`,
      [`& .${linearProgressClasses.bar}`]: {
         backgroundColor: "#E3F8F5 !important",
      },
   },
   count: {
      color: "primary.main",
   },
})

type GroupQuestionsProps = {}

const GroupQuestions: FC<GroupQuestionsProps> = () => {
   const { livestreamId } = useFeedbackPageContext()
   const { group } = useGroup()
   const { data: livestream, status, error } = useLivestream(livestreamId)

   if (status === "loading") return null

   const groupQuestions = livestream?.groupQuestionsMap?.[group.id]

   if (!Object.keys(groupQuestions?.questions).length) {
      // no questions, no UI
      return null
   }

   return (
      <Stack spacing={2}>
         <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h5" fontWeight={600}>
               Registration Questions
            </Typography>
         </Stack>
         <Box>
            <Grid container spacing={2}>
               {Object.entries(groupQuestions.questions).map(
                  ([id, question]) => (
                     <QuestionEntry
                        key={id}
                        question={question}
                        groupId={group.id}
                        livestreamId={livestreamId}
                     />
                  )
               )}
            </Grid>
         </Box>
      </Stack>
   )
}

type QuestionEntryProps = {
   question: LivestreamGroupQuestion
   livestreamId: string
   groupId: string
}

const QuestionEntry: FC<QuestionEntryProps> = ({
   question,
   livestreamId,
   groupId,
}) => {
   const { count, loading } = useGroupQuestionsVotersCount(
      livestreamId,
      groupId,
      question.id
   )

   if (loading) {
      return (
         <Grid sx={cardVotesStyles.gridItem} item xs={12} md={6} lg={4}>
            <CardVotersSkeleton />
         </Grid>
      )
   }

   if (count === 0) return null // no votes, so don't show

   return (
      <Grid sx={cardVotesStyles.gridItem} item xs={12} md={6} lg={4}>
         <Stack spacing={1} sx={[cardVotesStyles.entryRoot, styles.entryRoot]}>
            <Typography variant="body2">
               {loading ? "..." : count || 0} votes
            </Typography>
            <Typography variant="h6" fontWeight={600}>
               {question.name}
            </Typography>
            <Stack spacing={2}>
               {Object.entries(question.options).map(([id, option]) => (
                  <QuestionOption
                     key={id}
                     option={option}
                     questionId={question.id}
                     groupId={groupId}
                     livestreamId={livestreamId}
                     totalVotes={count ?? 0}
                  />
               ))}
            </Stack>
         </Stack>
      </Grid>
   )
}

type QuestionOptionProps = {
   livestreamId: string
   questionId: string
   groupId: string
   option: GroupQuestionOption
   totalVotes: number
}

const QuestionOption: FC<QuestionOptionProps> = ({
   option,
   groupId,
   questionId,
   livestreamId,
   totalVotes,
}) => {
   const { count } = useGroupQuestionsVotersCount(
      livestreamId,
      groupId,
      questionId,
      option.id
   )

   return (
      <Box sx={cardVotesStyles.optionRoot}>
         <Stack
            spacing={1.1}
            direction="row"
            alignItems="center"
            sx={cardVotesStyles.optionDetails}
         >
            <Box sx={[cardVotesStyles.count, styles.count]}>
               <Typography variant="body2" fontWeight={600}>
                  {count ?? 0}
               </Typography>
            </Box>
            <Typography fontSize="0.95rem" lineHeight="1.5rem" variant="body2">
               {option.name}
            </Typography>
         </Stack>
         <LinearProgress
            sx={[cardVotesStyles.optionProgress, styles.optionProgress]}
            variant="determinate"
            value={count ? (count / totalVotes) * 100 : 0}
         />
      </Box>
   )
}

const useGroupQuestionsVotersCount = (
   livestreamId: string,
   groupId: string,
   questionId: string,
   optionId?: string
) => {
   let constraint: QueryConstraint

   if (optionId) {
      // count answers for a specific question option
      constraint = where(`answers.${groupId}.${questionId}`, "==", optionId)
   } else {
      // count answers for a specific question
      constraint = where(`answers.${groupId}.${questionId}`, "!=", null)
   }

   return useCountQuery(
      query(
         collection(
            FirestoreInstance,
            "livestreams",
            livestreamId,
            "userLivestreamData"
         ),
         constraint
      )
   )
}

export default GroupQuestions
