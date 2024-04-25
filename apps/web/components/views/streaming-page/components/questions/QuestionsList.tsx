import { Collapse, Stack, useTheme } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamQuestions } from "components/custom-hook/streaming/question/useLivestreamQuestions"
import { SwipeablePanel } from "materialUI/GlobalPanels/GlobalPanels"
import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
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
   setTabValue: (value: QuestionTab) => void
}

export const QuestionsList = ({
   setTabValue,
   tabValue,
   onQuestionMarkedAsAnswered,
}: Props) => {
   const theme = useTheme()
   const handleChangeIndex = (index: QuestionTab) => {
      setTabValue(index)
   }

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
            onChangeIndex={handleChangeIndex}
         >
            <SwipeablePanel value={QuestionTab.UPCOMING} index={tabValue}>
               <ListView
                  onQuestionMarkedAsAnswered={onQuestionMarkedAsAnswered}
                  tabValue={QuestionTab.UPCOMING}
               />
            </SwipeablePanel>
            <SwipeablePanel value={QuestionTab.ANSWERED} index={tabValue}>
               <ListView
                  onQuestionMarkedAsAnswered={onQuestionMarkedAsAnswered}
                  tabValue={QuestionTab.ANSWERED}
               />
            </SwipeablePanel>
         </SwipeableViews>
      </SuspenseWithBoundary>
   )
}

type ListViewProps = {
   tabValue: QuestionTab
   onQuestionMarkedAsAnswered: () => void
}

const ListView = ({
   tabValue: type,
   onQuestionMarkedAsAnswered,
}: ListViewProps) => {
   const { livestreamId } = useStreamingContext()

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
         <Stack spacing={2} overflow="hidden" component={TransitionGroup}>
            {questions.map((question, index) => (
               <Collapse
                  ref={index === questions.length - 1 ? ref : null}
                  key={question.id}
               >
                  <QuestionCard
                     question={question}
                     onQuestionMarkedAsAnswered={onQuestionMarkedAsAnswered}
                  />
               </Collapse>
            ))}
         </Stack>
      </QuestionsListContextProvider>
   )
}
