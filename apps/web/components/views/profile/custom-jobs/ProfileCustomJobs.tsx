import { Box, Button, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useCustomJobsGroupNames from "components/custom-hook/custom-job/useCustomJobsGroupNames"
import { useUserAppliedJobs } from "components/custom-hook/custom-job/useUserAppliedJobs"
import { useUserInitiatedJobs } from "components/custom-hook/custom-job/useUserInitiatedJobs"
import { useUserSavedJobs } from "components/custom-hook/custom-job/useUserSavedJobs"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import { EmptyItemsView } from "components/views/common/EmptyItemsView"
import CustomJobsList from "components/views/jobs/components/custom-jobs/CustomJobsList"
import { JobCardSkeleton } from "components/views/streaming-page/components/jobs/JobListSkeleton"
import { useState } from "react"
import { Bookmark, Briefcase } from "react-feather"
import { sxStyles } from "types/commonTypes"

const TAB_VALUES = {
   saved: {
      value: "saved",
      label: "Saved",
   },
   initiated: {
      value: "initiated",
      label: "Initiated",
   },
   applied: {
      value: "applied",
      label: "Applied",
   },
}

const JOBS_DIALOG_LINK = "/profile/my-jobs/jobs"

const TALENT_PROFILE_JOBS_DIALOG_LINK = "/profile/career/jobs"

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
   talentProfileTabsBtnWrapper: {
      justifyContent: "center",
      border: (theme) => `1px solid ${theme.brand.white[500]}`,
      borderRadius: "66px",
      backgroundColor: (theme) => theme.brand.white[300],
      p: "5px",
      width: {
         xs: "100%",
         sm: "100%",
         md: "550px",
      },
   },
   talentProfileTabsContentWrapper: {
      mt: 2,
      mb: "16px !important",
   },
   stateButton: {
      width: "100%",
      "&:hover": {
         backgroundColor: (theme) => theme.brand.white[500],
      },
   },
   selectedButton: {
      "&:hover": {
         backgroundColor: (theme) => theme.palette.primary.main,
      },
   },
   selectedTabButtonText: {
      color: (theme) => theme.brand.white[100],
      fontWeight: 400,
   },
   tabButtonText: {
      color: (theme) => theme.palette.neutral[400],
      fontWeight: 400,
   },
   tabsContentWrapper: {
      mt: 3,
      mx: 2,
      mb: {
         xs: 3,
         sm: 3,
         md: 40,
      },
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
   jobWrapper: {
      p: "0px !important",
   },
})

const ProfileCustomJobs = () => {
   const [tabValue, setTabValue] = useState(TAB_VALUES.initiated.value)

   const handleTabChange = (_, newValue) => {
      setTabValue(newValue)
   }

   const TalentProfileTabsButtons = () => {
      const isInitiatedSelected = tabValue === TAB_VALUES.initiated.value
      const isAppliedSelected = tabValue === TAB_VALUES.applied.value
      const isSavedSelected = tabValue === TAB_VALUES.saved.value

      const onClickSaved = (event) =>
         handleTabChange(event, TAB_VALUES.saved.value)
      const onClickInitiated = (event) =>
         handleTabChange(event, TAB_VALUES.initiated.value)
      const onClickApplied = (event) =>
         handleTabChange(event, TAB_VALUES.applied.value)

      return (
         <Stack direction={"row"} justifyContent={"center"} mt={"20px"} mx={2}>
            <Stack
               direction={"row"}
               sx={styles.talentProfileTabsBtnWrapper}
               spacing={"9px"}
            >
               <Button
                  variant={isSavedSelected ? "contained" : "text"}
                  sx={[
                     styles.stateButton,
                     isSavedSelected ? styles.selectedButton : null,
                  ]}
                  onClick={onClickSaved}
               >
                  <Typography
                     variant="brandedBody"
                     sx={
                        isSavedSelected
                           ? styles.selectedTabButtonText
                           : styles.tabButtonText
                     }
                  >
                     Saved
                  </Typography>
               </Button>
               <Button
                  variant={isInitiatedSelected ? "contained" : "text"}
                  sx={[
                     styles.stateButton,
                     isInitiatedSelected ? styles.selectedButton : null,
                  ]}
                  onClick={onClickInitiated}
               >
                  <Typography
                     variant="brandedBody"
                     sx={
                        isInitiatedSelected
                           ? styles.selectedTabButtonText
                           : styles.tabButtonText
                     }
                  >
                     Initiated
                  </Typography>
               </Button>
               <Button
                  variant={isAppliedSelected ? "contained" : "text"}
                  sx={[
                     styles.stateButton,
                     isAppliedSelected ? styles.selectedButton : null,
                  ]}
                  onClick={onClickApplied}
               >
                  <Typography
                     variant="brandedBody"
                     sx={
                        isAppliedSelected
                           ? styles.selectedTabButtonText
                           : styles.tabButtonText
                     }
                  >
                     Applied
                  </Typography>
               </Button>
            </Stack>
         </Stack>
      )
   }

   return (
      <Box>
         <TalentProfileTabsButtons />
         <Box
            sx={[
               styles.tabsContentWrapper,
               styles.talentProfileTabsContentWrapper,
            ]}
         >
            {tabValue === TAB_VALUES.initiated.value && (
               <UserInitiatedCustomJobs />
            )}
            {tabValue === TAB_VALUES.applied.value && <UserAppliedCustomJobs />}
            {tabValue === TAB_VALUES.saved.value && <UserSavedCustomJobsView />}
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
   return (
      <SuspenseWithBoundary fallback={<JobCardSkeleton />}>
         <UserInitiatedCustomJobsView />
      </SuspenseWithBoundary>
   )
}

const UserInitiatedCustomJobsView = () => {
   const { userData } = useAuth()
   const { talentProfileV1 } = useFeatureFlags()
   const initiatedJobs = useUserInitiatedJobs(userData.id)
   const { data: jobsGroupNamesMap } = useCustomJobsGroupNames(initiatedJobs)

   if (!initiatedJobs?.length) return <UserEmptyApplications />

   return (
      <CustomJobsList
         customJobs={initiatedJobs}
         hrefLink={
            talentProfileV1 ? TALENT_PROFILE_JOBS_DIALOG_LINK : JOBS_DIALOG_LINK
         }
         jobWrapperSx={styles.jobWrapper}
         jobsGroupNamesMap={jobsGroupNamesMap}
      />
   )
}

const UserAppliedCustomJobs = () => {
   return (
      <SuspenseWithBoundary fallback={<JobCardSkeleton />}>
         <UserAppliedCustomJobsView />
      </SuspenseWithBoundary>
   )
}

const UserAppliedCustomJobsView = () => {
   const { userData } = useAuth()
   const { talentProfileV1 } = useFeatureFlags()
   const appliedJobs = useUserAppliedJobs(userData.id)

   const { data: jobsGroupNamesMap } = useCustomJobsGroupNames(appliedJobs)

   if (!appliedJobs?.length) return <UserEmptyApplications />

   return (
      <CustomJobsList
         customJobs={appliedJobs}
         hrefLink={
            talentProfileV1 ? TALENT_PROFILE_JOBS_DIALOG_LINK : JOBS_DIALOG_LINK
         }
         jobWrapperSx={styles.jobWrapper}
         jobsGroupNamesMap={jobsGroupNamesMap}
         applied
      />
   )
}

const UserSavedCustomJobsView = () => {
   const { data: savedJobs } = useUserSavedJobs()
   const { data: jobsGroupNamesMap } = useCustomJobsGroupNames(savedJobs)

   if (!savedJobs?.length)
      return (
         <EmptyItemsView
            title="Save some jobs!"
            description="Start saving jobs to easily find and apply to them later."
            icon={<Bookmark width={"44px"} height={"44px"} />}
         />
      )

   return (
      <Box>
         <CustomJobsList
            customJobs={savedJobs}
            hrefLink={TALENT_PROFILE_JOBS_DIALOG_LINK}
            jobWrapperSx={styles.jobWrapper}
            jobsGroupNamesMap={jobsGroupNamesMap}
            applied
         />
      </Box>
   )
}

export default ProfileCustomJobs
