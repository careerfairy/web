import { Box, Stack } from "@mui/material"
import { EmptyItemsView } from "components/views/common/EmptyItemsView"
import { sxStyles } from "types/commonTypes"
import { useCompanyPage } from ".."
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

// export const JobsTabView = () => {
//    return (
//       <SuspenseWithBoundary>
//          <JobsTab />
//       </SuspenseWithBoundary>
//    )
// }

export const JobsTab = () => {
   const { customJobs } = useCompanyPage()

   if (!customJobs?.length) return null

   return (
      <Box sx={styles.wrapper}>
         <Stack width={"100%"} spacing={2}>
            {customJobs?.length ? (
               <GroupJobsList jobs={customJobs} />
            ) : (
               <EmptyItemsView
                  title="There are no jobs at the moment"
                  description="Make sure to follow the company to receive their latest opportunities and updates."
               />
            )}
         </Stack>
      </Box>
   )
}
