import { FC } from "react"
import { Box, Button } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import useIsMobile from "components/custom-hook/useIsMobile"
import { TAB_VALUES } from "./LivestreamAdminDetailTopBarNavigation"
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded"

const styles = sxStyles({
   root: {
      display: "flex",
      justifyContent: {
         xs: "left",
         md: "space-between",
      },
      paddingBottom: 4,
   },
})

const changeToNewTab = (
   currentTab: TAB_VALUES,
   changeTab: LivestreamAdminDetailTopBarNavigationProps["changeTab"],
   step: number
) => {
   const tabValues = Object.values(TAB_VALUES)
   const currentTabIndex = tabValues.indexOf(currentTab)
   const newTab = tabValues[currentTabIndex + step]
   changeTab(newTab)
}

type LivestreamAdminDetailTopBarNavigationProps = {
   currentTab: TAB_VALUES
   changeTab: (TAB_VALUE) => void
}

const LivestreamAdminDetailBottomBarNavigation: FC<
   LivestreamAdminDetailTopBarNavigationProps
> = ({ currentTab, changeTab }) => {
   const isMobile = useIsMobile()

   return (
      <Box sx={styles.root}>
         <Button
            disabled={currentTab === TAB_VALUES.GENERAL}
            onClick={() => changeToNewTab(currentTab, changeTab, -1)}
         >
            {isMobile ? <ArrowBackIosNewRoundedIcon /> : "Back"}
         </Button>
         <Button
            disabled={currentTab === TAB_VALUES.JOBS}
            onClick={() => changeToNewTab(currentTab, changeTab, 1)}
         >
            {isMobile ? <ArrowForwardIosRoundedIcon /> : "Next"}
         </Button>
      </Box>
   )
}

export default LivestreamAdminDetailBottomBarNavigation
