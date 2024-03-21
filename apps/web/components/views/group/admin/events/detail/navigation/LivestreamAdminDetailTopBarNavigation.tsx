import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Tab, Tabs } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { FC } from "react"
import { Info } from "react-feather"
import { useLivestreamCreationContext } from "../LivestreamCreationContext"
import { TAB_VALUES } from "../form/commons"
import { useLivestreamFormValues } from "../form/useLivestreamFormValues"

const styles = sxStyles({
   alertIconWrapper: {
      width: "16px",
      height: "16px",
      marginRight: "6px",
      alignContent: "center",
   },
})

const getStyles = (hasError: boolean) => {
   const conditionalErrorColor = hasError ? "#FE9B0E" : "#6749EA"

   return sxStyles({
      tabs: {
         width: "100%",
         "*": {
            textTransform: "none !important",
            fontWeight: "400 !important",
            fontSize: {
               md: "16px !important",
            },
         },
         ".Mui-selected": {
            fontWeight: "600 !important",
            color: `${conditionalErrorColor} !important`,
         },
         ".MuiTabs-indicator": {
            position: "absolute",
            backgroundColor: `${conditionalErrorColor} !important`,
         },
         ".MuiTouchRipple-child": {
            backgroundColor: "#EBEBEF !important",
         },
         ".MuiTab-root": {
            minHeight: "48px !important",
         },
      },
   })
}

const TabAlertIcon = () => (
   <Box sx={styles.alertIconWrapper}>
      <Info size={16} color="#FE9B0E" strokeWidth={3} />
   </Box>
)

const LivestreamAdminDetailTopBarNavigation: FC = () => {
   const isMobile = useIsMobile()

   const { errors } = useLivestreamFormValues()
   const {
      shouldShowAlertIndicator,
      tabValue,
      setTabValue,
      navigateWithValidationCheck,
      shouldShowAlertIndicatorOnTab,
   } = useLivestreamCreationContext()

   const styles = getStyles(shouldShowAlertIndicatorOnTab[tabValue])

   return (
      <Tabs
         value={tabValue}
         onChange={(_, newValue) => {
            navigateWithValidationCheck(() => setTabValue(newValue))
         }}
         aria-label="Livestream Creation Form Tabs"
         sx={styles.tabs}
      >
         <Tab
            label="General"
            value={TAB_VALUES.GENERAL}
            icon={
               errors.general && shouldShowAlertIndicator ? (
                  <TabAlertIcon />
               ) : undefined
            }
            iconPosition="start"
         />
         <Tab
            label="Speakers"
            value={TAB_VALUES.SPEAKERS}
            icon={
               errors.speakers && shouldShowAlertIndicator ? (
                  <TabAlertIcon />
               ) : undefined
            }
            iconPosition="start"
         />
         <Tab label="Questions" value={TAB_VALUES.QUESTIONS} />
         <Tab
            label={isMobile ? "Jobs" : "Job openings"}
            value={TAB_VALUES.JOBS}
         />
      </Tabs>
   )
}

export default LivestreamAdminDetailTopBarNavigation
