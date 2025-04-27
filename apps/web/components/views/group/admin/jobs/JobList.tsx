import {
   CustomJob,
   CustomJobStats,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, ListItem, Stack } from "@mui/material"
import JobCard from "components/views/common/jobs/JobCard"
import { FC, useMemo } from "react"
import { sxStyles } from "../../../../../types/commonTypes"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import CreateJobButton from "../../../admin/jobs/components/CreateJobButton"
import JobSearch from "./JobSearch"

const styles = sxStyles({
   wrapper: {
      mx: { xs: 2, md: 5 },
      my: 2,
   },
   createButton: {
      display: "flex",
      width: "100%",
      height: "40px",
   },
   searchWrapper: {
      display: "flex",
      flexDirection: "column",
      pb: { xs: 2 },
   },
   listItem: {
      p: 0,

      "&:hover": {
         cursor: "pointer",
      },
   },
})

type Props = {
   jobWithStats: CustomJobStats[]
   handCLick: (job: CustomJob) => void
}

const JobList: FC<Props> = ({ jobWithStats, handCLick }) => {
   const isMobile = useIsMobile()

   const jobsOptions = useMemo(
      () => jobWithStats.map((jobWithStats) => jobWithStats.job),
      [jobWithStats]
   )

   return (
      <Box sx={styles.wrapper}>
         <Stack spacing={2} sx={styles.searchWrapper}>
            {isMobile ? <CreateJobButton sx={styles.createButton} /> : null}
            <JobSearch options={jobsOptions} />
         </Stack>
         <Stack spacing={2}>
            {jobWithStats.map(({ job, clicks, applicants, views }) => (
               <ListItem key={job.id} sx={styles.listItem}>
                  <JobCard
                     job={job}
                     clicks={clicks}
                     applicants={applicants}
                     views={views}
                     handleClick={handCLick}
                  />
               </ListItem>
            ))}
         </Stack>
      </Box>
   )
}

export default JobList
