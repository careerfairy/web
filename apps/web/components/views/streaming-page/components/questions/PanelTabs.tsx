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
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"

const BORDER_RADIUS = 51
const BORDER_THICKNESS = 1
const HEIGHT = 40

const styles = sxStyles({
   root: (theme) => ({
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
      fontSize: "16px",
      lineHeight: 1.5,
      zIndex: 1,
      color: theme.brand.black[700],
      [`&.${tabClasses.selected}`]: {
         color: "white",
      },
      transition: theme.transitions.create("color"),
   }),

   count: {
      mt: "auto",
      mb: "2px",
      lineHeight: 2,
   },
})

export enum QuestionTab {
   UPCOMING = "upcoming",
   ANSWERED = "answered",
}

type PanelTabsProps = {
   value: QuestionTab
   setValue: (value: QuestionTab) => void
}

const formatCount = (count: number) => {
   if (!count) return ""

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

   const handleChange = (
      _event: React.SyntheticEvent,
      newValue: QuestionTab
   ) => {
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
                  <span>Upcoming</span>
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
         />
         <Tab
            label={
               <Stack direction="row" spacing={0.5}>
                  <span>Answered</span>
                  {Boolean(answeredCountString) && (
                     <Typography sx={styles.count} variant="xsmall">
                        {answeredCountString}
                     </Typography>
                  )}
               </Stack>
            }
            value={QuestionTab.ANSWERED}
            {...swipeableTabA11yProps(1)}
            sx={styles.tab}
         />
      </Tabs>
   )
}
