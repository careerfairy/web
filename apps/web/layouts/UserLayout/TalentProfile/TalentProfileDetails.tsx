import { Box, Tab, Tabs } from "@mui/material"
import { useState } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      backgroundColor: "white",
      borderRadius: "12px 12px 12px 12px",
      minHeight: "400px",
   },
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
})

const TAB_VALUES = {
   profile: {
      value: "profile",
      label: "Profile",
   },
   jobs: {
      value: "jobs",
      label: "Jobs",
   },
   company: {
      value: "companies",
      label: "Companies",
   },
}

const TalentProfileDetails = () => {
   const [tabValue, setTabValue] = useState(TAB_VALUES.profile.value)

   const handleTabChange = (_, newValue) => {
      setTabValue(newValue)
   }

   return (
      <Box sx={styles.root}>
         <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="Job tabs"
            sx={styles.tabs}
         >
            <Tab
               label={TAB_VALUES.profile.label}
               value={TAB_VALUES.profile.value}
            />
            <Tab label={TAB_VALUES.jobs.label} value={TAB_VALUES.jobs.value} />
            <Tab
               label={TAB_VALUES.company.label}
               value={TAB_VALUES.company.value}
            />
         </Tabs>
         <Box>{`${tabValue} content here`}</Box>
      </Box>
   )
}

export default TalentProfileDetails
