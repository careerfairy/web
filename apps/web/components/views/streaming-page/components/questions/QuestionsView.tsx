import { Box, CircularProgress, Stack, useScrollTrigger } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { RefObject, useState } from "react"
import { useTimeout } from "react-use"
import { sxStyles } from "types/commonTypes"
import { PanelTabs, QuestionTab } from "./PanelTabs"
import { QuestionsList } from "./QuestionsList"

const styles = sxStyles({
   tabs: {
      position: "sticky",
      top: 0,
      zIndex: 1,
      p: 1.5,
      backgroundColor: (theme) => theme.brand.white[100],
      transition: (theme) => theme.transitions.create("box-shadow"),
   },
   tabsFloating: {
      boxShadow: "0px 0px 12px 0px rgba(20, 20, 20, 0.08)",
   },
   questions: {
      p: 1.5,
      pt: 0,
   },
})

type Props = {
   scrollToTop: () => void
   containerRef: RefObject<HTMLElement>
}

export const QuestionsView = (props: Props) => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <Content {...props} />
      </SuspenseWithBoundary>
   )
}

const Content = ({ scrollToTop, containerRef }: Props) => {
   const [tabValue, setTabValue] = useState(QuestionTab.UPCOMING)

   // Force re-render so containerRef is updated from null to HTMLElement
   useTimeout()

   const tabsFloating = useScrollTrigger({
      target: containerRef.current || undefined,
      threshold: 0,
      disableHysteresis: true,
   })

   const handleChangeTab = (tab: QuestionTab) => {
      setTabValue(tab)
      scrollToTop()
   }

   return (
      <Stack>
         <Box sx={[styles.tabs, tabsFloating && styles.tabsFloating]}>
            <PanelTabs value={tabValue} setValue={handleChangeTab} />
         </Box>
         <Box sx={styles.questions}>
            <QuestionsList
               tabValue={tabValue}
               setTabValue={handleChangeTab}
               onQuestionMarkedAsAnswered={scrollToTop}
            />
         </Box>
      </Stack>
   )
}
