import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import { Box, Button, Container, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { BrandedTabs } from "components/views/common/BrandedTabs"
import { useRouter } from "next/router"
import { SyntheticEvent } from "react"
import { RefreshCw } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { SparksAudienceTab } from "./audience-tab"
import { SparksCompetitorTab } from "./competitor-tab"
import { ResponsiveSelectWithDrawer } from "./components/ResponsiveSelectWithDrawer"
import { SparksOverviewTab } from "./overview-tab"
import { useSparksAnalytics } from "./SparksAnalyticsContext"

const UPDATE_ICON_SIZE = 18

const styles = sxStyles({
   root: {},
   controlHeader: {
      display: "flex",
      justifyContent: "space-between",
      flexDirection: {
         xs: "column",
         md: "row",
      },
      marginTop: { sm: 1, md: 1.5 },
      marginBottom: { md: "20px" },
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
      flexDirection: {
         xs: "row-reverse",
         md: "row",
      },
      justifyContent: {
         xs: "space-between",
         md: "center",
      },
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
   updateControlsWrapper: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 1,
   },
   updateIcon: (theme) => ({
      height: UPDATE_ICON_SIZE,
      width: UPDATE_ICON_SIZE,
      color: theme.palette.neutral["500"],
   }),
   updatedAtLabel: (theme) => ({
      color: theme.palette.neutral["500"],
      textAlign: "right",
      lineHeight: {
         xs: "17px",
         md: "initial",
      },
   }),
   spinningAnimation: {
      "@keyframes spin": {
         "0%": { transform: "rotate(0deg)" },
         "100%": { transform: "rotate(360deg)" },
      },
      animation: "spin 1s linear infinite",
   },
})

const UpdatedAtLabel = () => {
   const { updatedAtLabel, isLoading } = useSparksAnalytics()
   const isMobile = useIsMobile()

   if (isLoading) {
      return <Typography sx={styles.updatedAtLabel}>Updating...</Typography>
   }

   return (
      Boolean(updatedAtLabel) && (
         <Typography sx={styles.updatedAtLabel}>
            Last updated:{isMobile ? <br /> : " "}
            {updatedAtLabel}
         </Typography>
      )
   )
}

type TimeFilter = {
   value: TimePeriodParams
   label: string
}

const tabs = [
   { label: "Overview", value: "overview" },
   { label: "Audience", value: "audience" },
   { label: "Competitor", value: "competitor" },
] as const

type TabValue = (typeof tabs)[number]["value"]

const GroupSparkAnalytics = () => {
   const { query, push, pathname } = useRouter()
   const { selectTimeFilter, setSelectTimeFilter, updateAnalytics, isLoading } =
      useSparksAnalytics()

   // Get tab value from query params, default to "overview"
   const tabValue =
      tabs.find((tabItem) => tabItem.value === query.tab)?.value || "overview"

   const handleTabChange = (_: SyntheticEvent, newValue: TabValue) => {
      const cleanQuery = { ...query }
      cleanQuery.tab = newValue

      push(
         {
            pathname,
            query: cleanQuery,
         },
         undefined,
         { shallow: true }
      )
   }

   const options: TimeFilter[] = [
      { value: "7days", label: "Past 7 days" },
      { value: "30days", label: "Past 30 days" },
      { value: "6months", label: "Past 6 months" },
      { value: "1year", label: "Last year" },
   ]

   return (
      <Container maxWidth="xl" sx={styles.root}>
         <Box sx={styles.controlHeader}>
            <BrandedTabs activeValue={tabValue} onChange={handleTabChange}>
               {tabs.map((tab) => (
                  <BrandedTabs.Tab
                     key={tab.value}
                     label={tab.label}
                     value={tab.value}
                  />
               ))}
            </BrandedTabs>
            <Box component="span" sx={styles.mobileLimiter} />
            <Box sx={styles.controlsWrapper}>
               <Box sx={styles.updateControlsWrapper}>
                  <UpdatedAtLabel />
                  <Button
                     onClick={updateAnalytics}
                     sx={styles.updateButton}
                     disabled={isLoading}
                  >
                     <Box
                        sx={[
                           isLoading ? styles.spinningAnimation : {},
                           styles.updateIcon,
                        ]}
                     >
                        <RefreshCw size={UPDATE_ICON_SIZE} />
                     </Box>
                  </Button>
               </Box>
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
      </Container>
   )
}

export default GroupSparkAnalytics
