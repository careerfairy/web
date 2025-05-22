import { Stack } from "@mui/material"

import { Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { sxStyles } from "types/commonTypes"
import { useJobsOverviewContext } from "../JobsOverviewContext"
import { CustomJobsList } from "./CustomJobsList"
import { NoResultsFound } from "./search/SearchResultsCount"

const styles = sxStyles({
   root: {
      width: "339px",
      minWidth: {
         xs: "100%",
         md: "339px",
      },
      minHeight: "80vh",
   },
   listTitle: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[900],
   },
   title: {
      maxWidth: "calc(100% - 50px)",
   },
   typography: {
      maxWidth: "calc(100% - 50px)",
   },
   jobListItemWrapper: { m: 0, p: 0 },
})

export const CustomJobsOverviewList = () => {
   const { showDefaultJobs, showResultJobs, showOtherJobs } =
      useJobsOverviewContext()

   return (
      <Stack sx={styles.root} spacing={2}>
         <NoResultsFound />
         {showDefaultJobs ? <DefaultJobs /> : null}
         {showResultJobs ? <ResultJobs /> : null}
         {showOtherJobs ? <OtherJobs /> : null}
      </Stack>
   )
}

const DefaultJobs = () => {
   const { isLoggedIn } = useAuth()
   const { customJobs } = useJobsOverviewContext()
   const title = isLoggedIn ? "Right for you" : "Trending jobs"

   return (
      <Stack spacing={1}>
         <Typography variant="medium" sx={styles.listTitle}>
            {title}
            {" 🚀"}
         </Typography>
         {/* TODO: Replace with new Job Card */}
         <CustomJobsList customJobs={customJobs} />
      </Stack>
   )
}

const ResultJobs = () => {
   const { customJobs } = useJobsOverviewContext()

   return (
      <Stack spacing={1}>
         {/* TODO: Replace with new Job Card */}
         <CustomJobsList customJobs={customJobs} />
      </Stack>
   )
}

const OtherJobs = () => {
   const { customJobs } = useJobsOverviewContext()

   return (
      <Stack spacing={1}>
         <Typography variant="medium" sx={styles.listTitle}>
            Other jobs you might like
         </Typography>
         {/* TODO: Replace with new Job Card */}
         <CustomJobsList customJobs={customJobs} />
      </Stack>
   )
}
