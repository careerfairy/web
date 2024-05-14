import { Collapse, Stack, useTheme } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useStreamIsLandscape } from "components/custom-hook/streaming"
import { useLivestreamQuestions } from "components/custom-hook/streaming/question/useLivestreamQuestions"
import useTraceUpdate from "components/custom-hook/utils/useTraceUpdate"
import { SwipeablePanel } from "materialUI/GlobalPanels/GlobalPanels"
import { memo, useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import Masonry from "react-responsive-masonry"
import SwipeableViews from "react-swipeable-views"
import { TransitionGroup } from "react-transition-group"
import { useStreamingContext } from "../../context"
import { QuestionTab } from "./PanelTabs"
import { QuestionCard } from "./QuestionCard"
import { QuestionCardSkeleton } from "./QuestionCardSkeleton"
import QuestionsListContextProvider from "./QuestionsLisProvider"
import { MIN_QUESTIONS_TO_SHOW } from "./util"

type Props = {
   tabValue: QuestionTab
   onQuestionMarkedAsAnswered?: () => void
   onQuestionHighlighted?: () => void
   setTabValue: (value: QuestionTab) => void
}

export const QuestionsList = memo((props: Props) => {
   useTraceUpdate(props)
   const {
      tabValue,
      setTabValue,
      onQuestionMarkedAsAnswered,
      onQuestionHighlighted,
   } = props
   const theme = useTheme()

   return (
      <SuspenseWithBoundary
         fallback={
            <Stack spacing={2}>
               <QuestionCardSkeleton />
               <QuestionCardSkeleton />
               <QuestionCardSkeleton />
            </Stack>
         }
      >
         <SwipeableViews
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={tabValue}
            onChangeIndex={setTabValue}
         >
            <SwipeablePanel value={QuestionTab.UPCOMING} index={tabValue}>
               <ListView
                  onQuestionMarkedAsAnswered={onQuestionMarkedAsAnswered}
                  onQuestionHighlighted={onQuestionHighlighted}
                  tabValue={QuestionTab.UPCOMING}
               />
            </SwipeablePanel>
            <SwipeablePanel value={QuestionTab.ANSWERED} index={tabValue}>
               <ListView
                  onQuestionMarkedAsAnswered={onQuestionMarkedAsAnswered}
                  onQuestionHighlighted={onQuestionHighlighted}
                  tabValue={QuestionTab.ANSWERED}
               />
            </SwipeablePanel>
         </SwipeableViews>
      </SuspenseWithBoundary>
   )
})

QuestionsList.displayName = "QuestionsList"

type ListViewProps = {
   tabValue: QuestionTab
   onQuestionMarkedAsAnswered: () => void
   onQuestionHighlighted: () => void
}

const ListView = ({
   tabValue: type,
   onQuestionMarkedAsAnswered,
   onQuestionHighlighted,
}: ListViewProps) => {
   const { livestreamId } = useStreamingContext()

   const streamIsLandscape = useStreamIsLandscape()

   const [limit, setLimit] = useState(MIN_QUESTIONS_TO_SHOW)

   const [ref, inView] = useInView()

   const { data: questions } = useLivestreamQuestions(livestreamId, {
      type: type === QuestionTab.UPCOMING ? "upcoming" : "answered",
      limit,
   })

   useEffect(() => {
      if (inView) {
         setLimit((prev) => prev + MIN_QUESTIONS_TO_SHOW)
      }
   }, [inView])

   return (
      <QuestionsListContextProvider>
         {streamIsLandscape ? (
            <Masonry columnsCount={streamIsLandscape ? 2 : 1} gutter="8px">
               {questions.map((question, index) => (
                  <QuestionCard
                     key={question.id}
                     ref={index === questions.length - 1 ? ref : null}
                     question={question}
                     onQuestionMarkedAsAnswered={onQuestionMarkedAsAnswered}
                     onQuestionHighlighted={onQuestionHighlighted}
                  />
               ))}
            </Masonry>
         ) : (
            <Stack spacing={1} component={TransitionGroup}>
               {questions.map((question, index) => (
                  <Collapse
                     key={question.id}
                     ref={index === questions.length - 1 ? ref : null}
                  >
                     <QuestionCard
                        question={question}
                        onQuestionMarkedAsAnswered={onQuestionMarkedAsAnswered}
                        onQuestionHighlighted={onQuestionHighlighted}
                     />
                  </Collapse>
               ))}
            </Stack>
         )}
      </QuestionsListContextProvider>
   )
}
