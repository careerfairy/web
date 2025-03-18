import { Box, Button, Skeleton, Stack, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { sxStyles } from "types/commonTypes"
import { TabValue, useCompanyPage } from ".."
import GroupJobsList from "../JobsSection/GroupJobsList"

const styles = sxStyles({
   titleSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
   wrapper: {
      position: "relative",
   },
   checkAllJobsButton: {
      mt: 2,
      borderRadius: "24px",
      border: (theme) => `1px solid ${theme.brand.tq[600]}`,
      background: (theme) => theme.brand.white[200],
      "&:hover": {
         background: (theme) => theme.palette.primary[50],
      },
   },
})

const Header = () => {
   return (
      <Typography variant="brandedH3" fontWeight={"600"} color="black">
         Jobs
      </Typography>
   )
}

const JobsTab = () => {
   const { customJobs, setActiveTab } = useCompanyPage()

   if (!customJobs?.length) return null

   return (
      <Box sx={styles.wrapper}>
         <SuspenseWithBoundary fallback={<JobsSectionDetailsSkeleton />}>
            <Stack width={"100%"} spacing={2}>
               <Box sx={styles.titleSection}>
                  <Header />
               </Box>
               <GroupJobsList jobs={customJobs} />
               {customJobs?.length ? (
                  <Button
                     variant="outlined"
                     color="primary"
                     sx={styles.checkAllJobsButton}
                     onClick={() => setActiveTab(TabValue.jobs)}
                  >
                     Check all job openings v2
                  </Button>
               ) : null}
            </Stack>
         </SuspenseWithBoundary>
      </Box>
   )
}

const JobsSectionDetailsSkeleton = () => {
   return (
      <Stack>
         <Header />
         <Stack>
            <Skeleton sx={{ m: 2 }} />
            <Skeleton sx={{ p: 4 }} />
         </Stack>
      </Stack>
   )
}

export default JobsTab
