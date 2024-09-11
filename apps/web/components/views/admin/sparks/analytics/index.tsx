import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import { Box, Button, Tab, Tabs, Typography } from "@mui/material"
import { useState } from "react"
import { RefreshCw } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { SparksAudienceTab } from "./audience-tab"
import { SparksCompetitorTab } from "./competitor-tab"
import { ResponsiveSelectWithDrawer } from "./components/ResponsiveSelectWithDrawer"
import { SparksOverviewTab } from "./overview-tab"
import { useSparksAnalytics } from "./SparksAnalyticsContext"

const UPDATE_ICON_SIZE = 18

const styles = sxStyles({
   root: {
      mx: "auto",
      width: "93.58%",
   },
   controlHeader: {
      display: "flex",
      justifyContent: "space-between",
      flexDirection: {
         xs: "column",
         md: "row",
      },
      marginTop: { md: "17px" },
      marginBottom: { md: "20px" },
   },
   tabs: {
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
   },
   mobileLimiter: {
      display: {
         md: "none",
      },
      width: {
         xs: "100%",
      },
      marginTop: {
         xs: "-2px",
      },
      borderBottom: {
         xs: "2px solid #EFEFEF",
      },
   },
   selectDrawer: {
      margin: {
         xs: "17px 0 12px 0",
         md: 0,
      },
   },
   controlsWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 1,
   },
   updateButton: (theme) => ({
      background: theme.brand.white["300"],
      border: `1px solid ${theme.palette.neutral["200"]}`,
      borderRadius: "100%",
      minWidth: "38px",
      maxWidth: "38px",
      minHeight: "38px",
      maxHeight: "38px",
      padding: 0,
      "&:hover": {
         backgroundColor: `${theme.palette.neutral["50"]}`,
      },
      ".MuiTouchRipple-child": {
         backgroundColor: `${theme.palette.neutral["50"]}`,
      },
   }),
   updateIcon: (theme) => ({
      height: UPDATE_ICON_SIZE,
      width: UPDATE_ICON_SIZE,
      color: theme.palette.neutral["500"],
   }),
   updatedAtLabel: (theme) => ({
      color: theme.palette.neutral["500"],
   }),
   spinningAnimation: {
      "@keyframes spin": {
         "0%": { transform: "rotate(0deg)" },
         "100%": { transform: "rotate(360deg)" },
      },
      animation: "spin 1s linear infinite",
   },
})

type TimeFilter = {
   value: TimePeriodParams
   label: string
}

const GroupSparkAnalytics = () => {
   const [tabValue, setTabValue] = useState("overview")
   const {
      selectTimeFilter,
      setSelectTimeFilter,
      updateAnalytics,
      updatedAtLabel,
      isLoading,
   } = useSparksAnalytics()
   const handleTabChange = (_, newValue) => {
      setTabValue(newValue)
   }

   const options: TimeFilter[] = [
      { value: "7days", label: "Past 7 days" },
      { value: "30days", label: "Past 30 days" },
      { value: "6months", label: "Past 6 months" },
      { value: "1year", label: "Last year" },
   ]

   return (
      <Box sx={styles.root}>
         <Box sx={styles.controlHeader}>
            <Tabs
               value={tabValue}
               onChange={handleTabChange}
               aria-label="Spark Analytics Tabs"
               sx={styles.tabs}
            >
               <Tab label="Overview" value="overview" />
               <Tab label="Audience" value="audience" />
               <Tab label="Competitor" value="competitor" />
            </Tabs>
            <Box component="span" sx={styles.mobileLimiter} />
            <Box sx={styles.controlsWrapper}>
               <Typography variant="small" sx={styles.updatedAtLabel}>
                  {updatedAtLabel}
               </Typography>
               <Button onClick={updateAnalytics} sx={styles.updateButton}>
                  <Box
                     sx={[
                        isLoading ? styles.spinningAnimation : {},
                        styles.updateIcon,
                     ]}
                  >
                     <RefreshCw size={UPDATE_ICON_SIZE} />
                  </Box>
               </Button>
               <ResponsiveSelectWithDrawer
                  selectValue={selectTimeFilter}
                  setSelectValue={setSelectTimeFilter}
                  options={options}
                  selectContainerProps={{
                     sx: styles.selectDrawer,
                  }}
               />
            </Box>
         </Box>
         <Box>
            {tabValue === "overview" && <SparksOverviewTab />}
            {tabValue === "audience" && <SparksAudienceTab />}
            {tabValue === "competitor" && <SparksCompetitorTab />}
         </Box>
      </Box>
   )
}

export default GroupSparkAnalytics
