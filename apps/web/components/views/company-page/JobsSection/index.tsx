import { Box, Button, Skeleton, Stack, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useMountedState } from "react-use"
import { sxStyles } from "types/commonTypes"
import { SectionAnchor, TabValue, useCompanyPage } from ".."
import GroupJobsList from "./GroupJobsList"

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
      <Typography variant="h4" fontWeight={"600"} color="black">
         Jobs
      </Typography>
   )
}

const JobsSection = () => {
   const {
      sectionRefs: { jobsSectionRef },
      customJobs,
   } = useCompanyPage()

   const isMounted = useMountedState()

   return (
      <Box sx={styles.wrapper}>
         <SectionAnchor ref={jobsSectionRef} tabValue={TabValue.jobs} />
         {isMounted() ? (
            <SuspenseWithBoundary>
               <Stack width={"100%"} spacing={2}>
                  <Box sx={styles.titleSection}>
                     <Header />
                  </Box>
                  <GroupJobsList jobs={customJobs} />
                  <Button
                     variant="outlined"
                     color="primary"
                     sx={styles.checkAllJobsButton}
                  >
                     Check all job openings
                  </Button>
               </Stack>
            </SuspenseWithBoundary>
         ) : (
            <JobsSectionDetailsSkeleton />
         )}
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

export default JobsSection
