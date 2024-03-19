import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Tab, Tabs } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { FC } from "react"
import { Info } from "react-feather"
import { useLivestreamCreationContext } from "../LivestreamCreationContext"
import { TAB_VALUES } from "../form/commons"
import { useLivestreamFormValues } from "../form/useLivestreamFormValues"

const getStyles = (hasError: boolean) => {
   const conditionalErrorColor = hasError ? "#FE9B0E" : "#6749EA"

   return sxStyles({
      tabs: {
         width: "100%",
         "*": {
            textTransform: "none !important",
            fontWeight: 400,
            fontSize: {
               md: "16px !important",
            },
         },
         ".Mui-selected": {
            fontWeight: 600,
            color: `${conditionalErrorColor} !important`,
         },
         ".MuiTabs-indicator": {
            position: "absolute",
            backgroundColor: `${conditionalErrorColor} !important`,
         },
         ".MuiTouchRipple-child": {
            backgroundColor: "#EBEBEF",
         },
         ".MuiTab-root": {
            minHeight: "48px !important",
         },
      },
   })
}

const TabAlertIcon = () => (
   <Box alignContent="center">
      <Info
         size={16}
         style={{ marginRight: "6px" }}
         color="#FE9B0E"
         strokeWidth={3}
      />
   </Box>
)

const LivestreamAdminDetailTopBarNavigation: FC = () => {
   const isMobile = useIsMobile()

   const { errors } = useLivestreamFormValues()
   console.log("🚀 ~ errors:", errors)
   const { shouldShowAlertIndicator, tabValue, setTabValue, tabNavigation } =
      useLivestreamCreationContext()

   const showAlertIndicatorStyles =
      shouldShowAlertIndicator &&
      (tabValue === TAB_VALUES.GENERAL || tabValue === TAB_VALUES.SPEAKERS) // is the user in a critical tab?

   const styles = getStyles(showAlertIndicatorStyles)

   return (
      <Tabs
         value={tabValue}
         onChange={(_, newValue) => {
            tabNavigation(() => setTabValue(newValue))
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
