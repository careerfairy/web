import { FC } from "react"
import { Tab, Tabs, TabsOwnProps } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import useIsMobile from "components/custom-hook/useIsMobile"

const styles = sxStyles({
   tabs: {
      width: "100%",
      marginBottom: "-2px",
      "*": {
         textTransform: "none !important",
         fontWeight: 400,
         fontSize: {
            md: "1.2rem",
         },
      },
      alignSelf: "center",
      ".Mui-selected": {
         fontWeight: 600,
         color: "#6749EA !important",
      },
      ".MuiTabs-indicator": {
         backgroundColor: "#6749EA",
      },
      ".MuiTouchRipple-child": {
         backgroundColor: "#EBEBEF",
      },
   },
})

export enum TAB_VALUES {
   GENERAL,
   SPEAKERS,
   QUESTIONS,
   JOBS,
}

type LivestreamAdminDetailTopBarNavigationProps = {
   tabValue: TabsOwnProps["value"]
   tabOnChange: TabsOwnProps["onChange"]
}

const LivestreamAdminDetailTopBarNavigation: FC<
   LivestreamAdminDetailTopBarNavigationProps
> = ({ tabValue, tabOnChange }) => {
   const isMobile = useIsMobile()

   return (
      <Tabs
         value={tabValue}
         onChange={tabOnChange}
         aria-label="Livestream Creation Form Tabs"
         sx={styles.tabs}
      >
         <Tab label="General" value={TAB_VALUES.GENERAL} />
         <Tab label="Speakers" value={TAB_VALUES.SPEAKERS} />
         <Tab label="Questions" value={TAB_VALUES.QUESTIONS} />
         <Tab
            label={isMobile ? "Jobs" : "Job openings"}
            value={TAB_VALUES.JOBS}
         />
      </Tabs>
   )
}

export default LivestreamAdminDetailTopBarNavigation
