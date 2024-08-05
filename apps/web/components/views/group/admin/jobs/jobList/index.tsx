import { CustomJobStats } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, ListItem, Stack } from "@mui/material"
import { useRouter } from "next/router"
import { FC, useCallback, useMemo } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import useGroupFromState from "../../../../../custom-hook/useGroupFromState"
import useIsMobile from "../../../../../custom-hook/useIsMobile"
import CreateJobButton from "../../../../admin/jobs/components/CreateJobButton"
import JobSearch from "../JobSearch"
import JobListCard from "./JobListCard"

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
}
const JobList: FC<Props> = ({ jobWithStats }) => {
   const isMobile = useIsMobile()
   const { push } = useRouter()
   const { group } = useGroupFromState()

   const handleJobClick = useCallback(
      (jobId: string) => {
         void push(`/group/${group.groupId}/admin/jobs/${jobId}`)
      },
      [group.groupId, push]
   )

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
            {jobWithStats.map(({ job, clicks, applicants }) => (
               <ListItem
                  key={job.id}
                  sx={styles.listItem}
                  onClick={() => handleJobClick(job.id)}
               >
                  <JobListCard
                     job={job}
                     clicks={clicks}
                     applicants={applicants}
                  />
               </ListItem>
            ))}
         </Stack>
      </Box>
   )
}

export default JobList
