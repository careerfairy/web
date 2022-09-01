import useLivestreamJobs from "../../../../../custom-hook/useLivestreamJobs"
import { List } from "@mui/material"
import React, { useCallback, useState } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import JobDialog from "./JobDialog"
import JobItem from "./JobItem"

const styles = sxStyles({
   list: {
      width: "100%",
      paddingX: 1,
   },
})

const JobList = ({ livestream }) => {
   const { jobs } = useLivestreamJobs(undefined, livestream.jobs)
   const [selectedJob, setSelectedJob] = useState(null)

   const onCloseDialog = useCallback(() => {
      setSelectedJob(null)
   }, [])

   if (jobs.length === 0) {
      return <div>No jobs at the moment</div>
   }

   return (
      <>
         <List sx={styles.list}>
            {jobs.map((job) => (
               <JobItem
                  key={job.id}
                  job={job}
                  handleSelectJob={setSelectedJob}
               />
            ))}
         </List>
         {selectedJob && (
            <JobDialog
               job={selectedJob}
               onCloseDialog={onCloseDialog}
               livestreamId={livestream.id}
            />
         )}
      </>
   )
}

export default JobList
