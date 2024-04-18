import { LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"
import { CommentCard } from "./CommentCard"
import { useQuestionsListContext } from "./QuestionsLisProvider"

type Props = {
   question: LivestreamQuestion
}
export const CommentsList = ({ question }: Props) => {
   const { onCommentOptionsClick } = useQuestionsListContext()

   if (!question.firstComment) return null

   return (
      <CommentCard
         comment={question.firstComment}
         onOptionsClick={(event) =>
            onCommentOptionsClick(event, question.id, question.firstComment)
         }
      />
   )
}
