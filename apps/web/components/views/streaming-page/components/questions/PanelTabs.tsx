import {
   Stack,
   Tab,
   Tabs,
   Typography,
   tabClasses,
   tabsClasses,
} from "@mui/material"
import { useCountTotalQuestions } from "components/custom-hook/streaming/question/useCountTotalQuestions"
import { swipeableTabA11yProps } from "materialUI/GlobalPanels/GlobalPanels"
import { SyntheticEvent } from "react"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { MIN_QUESTIONS_TO_SHOW } from "./util"

const BORDER_RADIUS = 51
const BORDER_THICKNESS = 1
const HEIGHT = 40

const styles = sxStyles({
   root: (theme) => ({
      position: "sticky",
      top: 0,
      zIndex: 1,
      [`& .${tabsClasses.indicator}`]: {
         height: "100%",
         zIndex: 0,
         borderRadius: `${BORDER_RADIUS}px`,
      },
      [`& .${tabsClasses.flexContainer}`]: {
         borderRadius: `${BORDER_RADIUS}px`,
         border: `${BORDER_THICKNESS}px solid ${theme.brand.white[500]}`,
         background: theme.brand.white[300],
      },
      borderRadius: `${BORDER_RADIUS}px`,
      boxShadow: "rgba(33, 35, 38, 0.1) 0px 10px 10px -10px", // Added shadow effect
      overflow: "hidden",
      minHeight: HEIGHT,
      height: HEIGHT,
   }),
   tab: (theme) => ({
      p: 0,
      flexWrap: "wrap",
      minHeight: "auto",
      height: HEIGHT - BORDER_THICKNESS * 2,
      borderRadius: `${BORDER_RADIUS}px`,
      textTransform: "none",
      zIndex: 1,
      color: theme.brand.black[700],
      [`&.${tabClasses.selected}`]: {
         color: "white",
      },
      transition: theme.transitions.create("color"),
   }),

   count: {
      mt: "auto !important",
      mb: "3px !important",
      lineHeight: "16px",
   },
})

export enum QuestionTab {
   UPCOMING,
   ANSWERED,
}

type PanelTabsProps = {
   value: QuestionTab
   setValue: (value: QuestionTab) => void
}

const formatCount = (count: number) => {
   if (!count) return ""

   if (count < MIN_QUESTIONS_TO_SHOW) {
      return ""
   }

   if (count > 99) {
      return "(99+)"
   }

   if (count < 1) {
      return ""
   }

   return `(${count})`
}

export const PanelTabs = ({ value, setValue }: PanelTabsProps) => {
   const { livestreamId } = useStreamingContext()

   const { count: upcomingQuestionsCount } = useCountTotalQuestions(
      livestreamId,
      "upcoming"
   )
   const { count: answeredQuestionsCount } = useCountTotalQuestions(
      livestreamId,
      "answered"
   )

   const upcomingCountString = formatCount(upcomingQuestionsCount)
   const answeredCountString = formatCount(answeredQuestionsCount)

   const handleChange = (_event: SyntheticEvent, newValue: QuestionTab) => {
      setValue(newValue)
   }

   return (
      <Tabs
         value={value}
         onChange={handleChange}
         indicatorColor="primary"
         textColor="inherit"
         variant="fullWidth"
         sx={styles.root}
         aria-label="Q&A Tabs"
      >
         <Tab
            label={
               <Stack direction="row" spacing={0.5}>
                  <Typography variant="medium">Upcoming</Typography>
                  {Boolean(upcomingCountString) && (
                     <Typography sx={styles.count} variant="xsmall">
                        {upcomingCountString}
                     </Typography>
                  )}
               </Stack>
            }
            value={QuestionTab.UPCOMING}
            {...swipeableTabA11yProps(0)}
            sx={styles.tab}
            disableTouchRipple
         />
         <Tab
            label={
               <Stack direction="row" spacing={0.5}>
                  <Typography variant="medium">Answered</Typography>
                  {Boolean(answeredCountString) && (
                     <Typography sx={styles.count} variant="xsmall">
                        {answeredCountString}
                     </Typography>
                  )}
               </Stack>
            }
            disableTouchRipple
            value={QuestionTab.ANSWERED}
            {...swipeableTabA11yProps(1)}
            sx={styles.tab}
         />
      </Tabs>
   )
}
