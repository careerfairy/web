import { Box, Button, Skeleton, Stack, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import Link from "next/link"
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
      <Typography variant="brandedH3" fontWeight={"600"} color="black">
         Jobs
      </Typography>
   )
}

const JobsSection = () => {
   const {
      sectionRefs: { jobsSectionRef },
      customJobs,
      getCompanyPageTabLink,
      tabMode,
      setActiveTab,
   } = useCompanyPage()

   if (!customJobs?.length) return null

   return (
      <Box sx={styles.wrapper}>
         <SectionAnchor ref={jobsSectionRef} tabValue={TabValue.jobs} />
         <SuspenseWithBoundary fallback={<JobsSectionDetailsSkeleton />}>
            <Stack width={"100%"} spacing={2}>
               <Box sx={styles.titleSection}>
                  <Header />
               </Box>
               <GroupJobsList jobs={customJobs.slice(0, 3)} />
               {customJobs?.length > 3 ? (
                  <Button
                     variant="outlined"
                     color="primary"
                     sx={styles.checkAllJobsButton}
                     href={getCompanyPageTabLink(TabValue.jobs)}
                     onClick={
                        tabMode ? () => setActiveTab(TabValue.jobs) : undefined
                     }
                     LinkComponent={tabMode ? "button" : Link}
                  >
                     Check all job openings
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

export default JobsSection
