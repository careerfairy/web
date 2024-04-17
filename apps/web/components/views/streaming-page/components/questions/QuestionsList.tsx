import { useLivestreamQuestions } from "components/custom-hook/streaming/useLivestreamQuestions"
import { useStreamingContext } from "../../context"
import { QuestionTab } from "./PanelTabs"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { CircularProgress, Slide, Stack } from "@mui/material"
import { QuestionCard } from "./QuestionCard"
import { TransitionGroup } from "react-transition-group"

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
      <Stack spacing={2} overflow="hidden" component={TransitionGroup}>
         {questions.map((question) => (
            <Slide key={question.id} direction="left">
               <QuestionCard
                  question={question}
                  onClickDelete={() => {}}
                  onClickReset={() => {}}
               />
            </Slide>
         ))}
      </Stack>
   )
}
