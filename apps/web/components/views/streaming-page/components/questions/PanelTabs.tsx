import { Tab, Tabs, tabsClasses, tabClasses } from "@mui/material"
import { swipeableTabA11yProps } from "materialUI/GlobalPanels/GlobalPanels"
import { sxStyles } from "types/commonTypes"

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
})

export enum QuestionTab {
   UPCOMING = "upcoming",
   ANSWERED = "answered",
}

type PanelTabsProps = {
   value: QuestionTab
   setValue: (value: QuestionTab) => void
}

export const PanelTabs = ({ value, setValue }: PanelTabsProps) => {
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
            label="Upcoming"
            value={QuestionTab.UPCOMING}
            {...swipeableTabA11yProps(0)}
            sx={styles.tab}
         />
         <Tab
            label="Answered"
            value={QuestionTab.ANSWERED}
            {...swipeableTabA11yProps(1)}
            sx={styles.tab}
         />
      </Tabs>
   )
}
