import { Box, Stack, Tab, Tabs, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { useState } from "react"
import { Briefcase } from "react-feather"
import { sxStyles } from "types/commonTypes"

const TAB_VALUES = {
   initiated: {
      value: "initiated",
      label: "Initiated",
   },
   applied: {
      value: "applied",
      label: "Applied",
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
   tabsContentWrapper: {
      mt: 3,
      mx: 2,
   },
   emptyApplications: {
      p: "20px",
      backgroundColor: (theme) => theme.brand.white[300],
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
      borderRadius: "8px",
   },
   noApplicationsYet: {
      fontSize: "16px",
      fontWeight: 600,
   },
   startApplying: {
      fontSize: "14px",
      fontWeight: 400,
   },
})

const ProfileCustomJobs = () => {
   // TODO-WG: set skeleton
   return (
      <SuspenseWithBoundary>
         <ProfileCustomJobsView />
      </SuspenseWithBoundary>
   )
}

const ProfileCustomJobsView = () => {
   const [tabValue, setTabValue] = useState(TAB_VALUES.initiated.value)

   const handleTabChange = (_, newValue) => {
      setTabValue(newValue)
   }

   return (
      <Box>
         <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="Job tabs"
            sx={styles.tabs}
         >
            <Tab
               label={TAB_VALUES.initiated.label}
               value={TAB_VALUES.initiated.value}
            />
            <Tab
               label={TAB_VALUES.applied.label}
               value={TAB_VALUES.applied.value}
            />
         </Tabs>
         <Box sx={styles.tabsContentWrapper}>
            <ConditionalWrapper
               condition={tabValue === TAB_VALUES.initiated.value}
            >
               <UserInitiatedCustomJobs />
            </ConditionalWrapper>
            <ConditionalWrapper
               condition={tabValue === TAB_VALUES.applied.value}
            >
               <UserAppliedCustomJobs />
            </ConditionalWrapper>
         </Box>
      </Box>
   )
}

const UserEmptyApplications = () => {
   return (
      <Box
         sx={styles.emptyApplications}
         display={"flex"}
         flexDirection="column"
         alignItems={"center"}
         justifyContent={"center"}
      >
         <Stack alignItems={"center"}>
            <Box color={"primary.main"} mb={1.5}>
               <Briefcase width={"44px"} height={"44px"} />
            </Box>
            <Typography sx={styles.noApplicationsYet} color="neutral.800">
               No applications yet
            </Typography>
            <Typography sx={styles.startApplying} color={"neutral.600"}>
               Start applying to jobs and track your applications right here.
            </Typography>
         </Stack>
      </Box>
   )
}
const UserInitiatedCustomJobs = () => {
   const hasInitiatedJobs = false

   if (!hasInitiatedJobs) return <UserEmptyApplications />
   return <>User initiated jobs</>
}

const UserAppliedCustomJobs = () => {
   const hasAppliedJobs = false

   if (!hasAppliedJobs) return <UserEmptyApplications />

   return <>User applied jobs</>
}

export default ProfileCustomJobs
