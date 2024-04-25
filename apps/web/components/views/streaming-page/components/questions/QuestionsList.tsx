import { CircularProgress, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamQuestions } from "components/custom-hook/streaming/question/useLivestreamQuestions"
import { useStreamingContext } from "../../context"
import { QuestionTab } from "./PanelTabs"
import { QuestionCard } from "./QuestionCard"
import QuestionsListContextProvider from "./QuestionsLisProvider"

type Props = {
   type: QuestionTab
}
export const QuestionsList = (props: Props) => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <Content {...props} />
      </SuspenseWithBoundary>
   )
}

const Content = ({ type }: Props) => {
   const { livestreamId } = useStreamingContext()

   const { data: questions } = useLivestreamQuestions(livestreamId, {
      type,
      limit: 10,
   })

   return (
      <QuestionsListContextProvider>
         <Stack spacing={2} overflow="hidden">
            {questions.map((question) => (
               <QuestionCard key={question.id} question={question} />
            ))}
         </Stack>
      </QuestionsListContextProvider>
   )
}
