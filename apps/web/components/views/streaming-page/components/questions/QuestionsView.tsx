import { CircularProgress, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useState } from "react"
import { PanelTabs, QuestionTab } from "./PanelTabs"
import { QuestionsList } from "./QuestionsList"

type Props = {
   scrollToTop: () => void
}

export const QuestionsView = (props: Props) => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <Content {...props} />
      </SuspenseWithBoundary>
   )
}

const Content = ({ scrollToTop }: Props) => {
   const [tabValue, setTabValue] = useState(QuestionTab.UPCOMING)

   const handleChangeTab = (tab: QuestionTab) => {
      setTabValue(tab)
      scrollToTop()
   }

   return (
      <Stack spacing={1.5}>
         <PanelTabs value={tabValue} setValue={handleChangeTab} />
         <QuestionsList
            tabValue={tabValue}
            setTabValue={handleChangeTab}
            onQuestionMarkedAsAnswered={scrollToTop}
         />
      </Stack>
   )
}
