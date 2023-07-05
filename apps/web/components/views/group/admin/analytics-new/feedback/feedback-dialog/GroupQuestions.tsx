import { linearProgressClasses } from "@mui/material/LinearProgress"
import { alpha } from "@mui/material/styles"
import { FC, useState } from "react"
import { LivestreamGroupQuestion } from "@careerfairy/shared-lib/livestreams"
import { collection, query, QueryConstraint, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../../../data/firebase/FirebaseInstance"
import useCountQuery from "../../../../../../custom-hook/useCountQuery"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import useLivestream from "../../../../../../custom-hook/live-stream/useLivestream"
import { useFeedbackPageContext } from "../FeedbackPageProvider"
import { GroupQuestionOption } from "@careerfairy/shared-lib/src/groups"
import { sxStyles } from "../../../../../../../types/commonTypes"
import {
   CardVotes,
   CardVotesOption,
   SectionContainer,
   VoteOptionSkeleton,
} from "./CardVotes"
import { Button } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"

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
   expandButton: {
      borderRadius: 4,
      color: "black !important",
      textTransform: "none",
      fontSize: 13,
      fontWeight: "normal",
      border: `1px solid #E3F8F5 !important`,
   },
})

type GroupQuestionsProps = {}

const GroupQuestions: FC<GroupQuestionsProps> = () => {
   const { livestreamId } = useFeedbackPageContext()
   const { group } = useGroup()
   const { data: livestream, status } = useLivestream(livestreamId)

   if (status === "loading") return null

   const groupQuestions = livestream?.groupQuestionsMap?.[group.id]

   if (!groupQuestions || Object.keys(groupQuestions?.questions).length === 0) {
      // no questions, no UI
      return null
   }

   return (
      <SectionContainer title="Registration Questions">
         {Object.entries(groupQuestions.questions).map(([id, question]) => (
            <QuestionEntry
               key={id}
               question={question}
               groupId={group.id}
               livestreamId={livestreamId}
            />
         ))}
      </SectionContainer>
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

   const [showAll, setShowAll] = useState(false)

   if (loading) {
      return <VoteOptionSkeleton />
   }

   if (count === 0) return null // no votes, so don't show

   const onClick = () => setShowAll((prev) => !prev)

   const optionsEntries = Object.entries(question.options).slice(
      0,
      showAll ? undefined : 4
   )

   return (
      <CardVotes
         title={question.name}
         totalVotes={loading ? "..." : count || 0}
         sxRoot={styles.entryRoot}
      >
         {optionsEntries.map(([id, option]) => (
            <QuestionOption
               key={id}
               option={option}
               questionId={question.id}
               groupId={groupId}
               livestreamId={livestreamId}
               totalVotes={count ?? 0}
            />
         ))}
         <ExpandButton expanded={showAll} onClick={onClick} />
      </CardVotes>
   )
}

type ExpandButtonProps = {
   expanded: boolean
   onClick(): void
}

const ExpandButton = ({ expanded, onClick }: ExpandButtonProps) => {
   const icon = expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
   return (
      <Button
         sx={styles.expandButton}
         variant="outlined"
         endIcon={icon}
         onClick={onClick}
      >
         Show all answers
      </Button>
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
      <CardVotesOption
         count={count}
         title={option.name}
         total={totalVotes}
         sxProgress={styles.optionProgress}
         sxText={styles.count}
      />
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
