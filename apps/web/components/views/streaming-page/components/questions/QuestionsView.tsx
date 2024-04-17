import { CircularProgress, Stack } from "@mui/material"
import { PanelTabs, QuestionTab } from "./PanelTabs"
import { useState } from "react"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { QuestionsList } from "./QuestionsList"

export const QuestionsView = () => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <Content />
      </SuspenseWithBoundary>
   )
}

const Content = () => {
   const [value, setValue] = useState(QuestionTab.UPCOMING)

   return (
      <Stack spacing={1.5}>
         <PanelTabs value={value} setValue={setValue} />
         <QuestionsList type={value} />
      </Stack>
   )
}
