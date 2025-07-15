import { Box, Stack, Tab, Tabs, Typography, useTheme } from "@mui/material"
import { useState } from "react"
import { Frown } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { AllTab } from "./results/AllTab"
import { CompaniesTab } from "./results/CompaniesTab"
import { JobsTab } from "./results/JobsTab"
import { LivestreamsTab } from "./results/LivestreamsTab"
import { RecordingsTab } from "./results/RecordingsTab"
import { useSearchContext } from "./SearchContext"

const TAB_VALUES = {
   all: {
      label: "All",
      value: "all",
      component: AllTab,
   },
   livestreams: {
      label: "Live streams",
      value: "livestreams",
      component: LivestreamsTab,
   },
   jobs: {
      label: "Jobs",
      value: "jobs",
      component: JobsTab,
   },
   companies: {
      label: "Companies",
      value: "companies",
      component: CompaniesTab,
   },
   recordings: {
      label: "Recordings",
      value: "recordings",
      component: RecordingsTab,
   },
}

const styles = sxStyles({
   tabs: {
      "& *": {
         textTransform: "none !important",
         fontWeight: "400 !important",
         fontSize: "16px !important",
      },
      "& .MuiTab-root.Mui-selected": {
         fontWeight: "600 !important",
         color: (theme) => theme.palette.primary.main,
      },
      "& .MuiTabs-indicator": {
         backgroundColor: (theme) => theme.palette.primary.main,
      },
      borderBottom: "1px solid #EAEAEA",
   },
   resultsContainer: {
      mt: { xs: 1.5, md: 2 },
   },
   notFoundRoot: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      borderRadius: "8px",
      border: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      background: (theme) => theme.brand.white[100],
      p: "52px 12px",
      mt: 2,
   },
})

export const SearchResults = () => {
   const [currentTab, setCurrentTab] = useState<string>(TAB_VALUES.all.value)
   const handleTabChange = (_, newValue: string) => {
      setCurrentTab(newValue)
   }

   const TabComponent =
      TAB_VALUES[currentTab as keyof typeof TAB_VALUES]?.component

   return (
      <Box sx={styles.resultsContainer}>
         <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="Search results tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={styles.tabs}
         >
            <Tab label={TAB_VALUES.all.label} value={TAB_VALUES.all.value} />
            <Tab
               label={TAB_VALUES.livestreams.label}
               value={TAB_VALUES.livestreams.value}
            />
            <Tab label={TAB_VALUES.jobs.label} value={TAB_VALUES.jobs.value} />
            <Tab
               label={TAB_VALUES.companies.label}
               value={TAB_VALUES.companies.value}
            />
            <Tab
               label={TAB_VALUES.recordings.label}
               value={TAB_VALUES.recordings.value}
            />
         </Tabs>

         {TabComponent ? <TabComponent /> : null}
      </Box>
   )
}

export const NoResultsFound = () => {
   const theme = useTheme()
   const { searchQuery } = useSearchContext()

   return (
      <Stack sx={styles.notFoundRoot} spacing={1}>
         <Frown size={40} color={theme.palette.neutral[600]} />
         <Typography
            variant="brandedBody"
            color="neutral.700"
            textAlign="center"
         >
            No results found {searchQuery ? "for" : ""}{" "}
            {searchQuery ? (
               <Typography
                  variant="brandedBody"
                  color="neutral.700"
                  fontWeight={600}
               >
                  &quot;{searchQuery}&quot;
               </Typography>
            ) : (
               ""
            )}
         </Typography>
      </Stack>
   )
}

export default SearchResults
