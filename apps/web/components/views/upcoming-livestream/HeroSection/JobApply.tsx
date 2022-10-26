import React, { useCallback, useEffect, useState } from "react"
import { SuspenseWithBoundary } from "../../../ErrorBoundary"
import JobDialog from "../../streaming/LeftMenu/categories/jobs/JobDialog"
import {
   Box,
   Button,
   List,
   ListItem,
   ListItemButton,
   ListItemIcon,
   ListItemText,
   Typography,
} from "@mui/material"
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { sxStyles } from "../../../../types/commonTypes"
import useUserLivestreamData from "../../../custom-hook/useUserLivestreamData"
import useLivestreamJobs from "../../../custom-hook/useLivestreamJobs"

const styles = sxStyles({
   itemWrapper: {
      boxShadow: (theme) => theme.shadows[3],
      background: (theme) => theme.palette.background.default,
      borderRadius: 2,
   },
   icon: {
      minWidth: "unset",
      marginRight: 2,
      alignSelf: "start",
      marginY: "5px",
   },
   list: {
      width: "100%",
      padding: 0,
   },
})

type Props = {
   livestream
}

const JobApply = ({ livestream }: Props) => {
   const [isLoading, registeredUser] = useUserLivestreamData(livestream.id)

   console.log("JobApply", isLoading, registeredUser)

   if (isLoading) {
      return "Loading user!"
   }

   if (!registeredUser) {
      return "you did not registered/participated in this livestream"
   }

   return (
      <SuspenseWithBoundary hide={true}>
         <JobList livestream={livestream} />
      </SuspenseWithBoundary>
   )
}

const JobList = ({ livestream }: Props) => {
   let { jobs } = useLivestreamJobs(livestream.id, livestream.jobs)
   const [selectedJob, setSelectedJob] = useState(null)

   // const jobs = [
   //    {
   //       hydrated: true,
   //       id: "8c46544b-918a-4500-b1a7-1f8ea8f5b9ad",
   //       name: "Open Student Applications",
   //       description:
   //          '<p style="text-align: left;"><em>Are you ready to accelerate your career in energy?</em> <em>Are you analytically minded and data-driven with endless curiosity? Would you like to join an international and dynamic team in the heart of Amsterdam? </em></p>\n<p style="text-align: left;">Priogen is an innovative Energy Trading company, based in Amsterdam. We are a member of EPEX, EEX &amp; Nordpool and trade across the curve, with emphasis on short term power trading. We are accelerating the energy transition by leveraging AI and machine learning, as the core of our business model is based on unparalleled fundamental analysis and cutting-edge modelling.</p>\n<p style="text-align: left;">We are looking for the next Priogen superstars to join our team. Whether you have just finished university and are looking to kickstart your career or you are looking for an internship to aid in writing your thesis, we want to hear from you! If there is an opportunity that matches your aspirations and skillset, we will get in touch. We are looking forward to receiving your application!</p>\n<p style="text-align: left;"><strong>What\'s in it for you?</strong></p>\n<ul>\n<li style="text-align: left;"><strong>Make your impact on the energy transition! </strong>We drive the energy transition through the active integration of renewable power into the grid.</li>\n<li style="text-align: left;"><strong>A true career! </strong>We hire to retain and want you to grow and become a superstar at Priogen.</li>\n<li style="text-align: left;"><strong>Colleagues who care! </strong>We have a very energetic and collaborative team.</li>\n<li style="text-align: left;"><strong>Interesting and challenging work! </strong>We offer roles with broad responsibilities, high autonomy and diverse tasks.</li>\n<li style="text-align: left;"><strong>Performance coaching and training!</strong> Aimed at strong personal development and career growth.</li>\n<li style="text-align: left;"><strong>Excellent benefits! </strong>Pension plan, commuting allowance, fitness subsidy, social events, and more.</li>\n<li style="text-align: left;"><strong>Living in Amsterdam! </strong>An exciting cultural and social hub with an international community.</li>\n</ul>',
   //       status: "OPEN",
   //       offices: [],
   //       hiringManagers: [],
   //       recruiters: [],
   //       departments: [],
   //       createdAt: 1621246865567,
   //       updatedAt: 1666712808185,
   //       descriptionStripped:
   //          "Are you ready to accelerate your career in energy? Are you analytically minded and data-driven with endless curiosity? Would you like to join an international and dynamic team in the heart of Amsterdam? \nPriogen is an innovative Energy Trading company, based in Amsterdam. We are a member of EPEX, EEX &amp; Nordpool and trade across the curve, with emphasis on short term power trading. We are accelerating the energy transition by leveraging AI and machine learning, as the core of our business model is based on unparalleled fundamental analysis and cutting-edge modelling.\nWe are looking for the next Priogen superstars to join our team. Whether you have just finished university and are looking to kickstart your career or you are looking for an internship to aid in writing your thesis, we want to hear from you! If there is an opportunity that matches your aspirations and skillset, we will get in touch. We are looking forward to receiving your application!\nWhat's in it for you?\n\nMake your impact on the energy transition! We drive the energy transition through the active integration of renewable power into the grid.\nA true career! We hire to retain and want you to grow and become a superstar at Priogen.\nColleagues who care! We have a very energetic and collaborative team.\nInteresting and challenging work! We offer roles with broad responsibilities, high autonomy and diverse tasks.\nPerformance coaching and training! Aimed at strong personal development and career growth.\nExcellent benefits! Pension plan, commuting allowance, fitness subsidy, social events, and more.\nLiving in Amsterdam! An exciting cultural and social hub with an international community.\n",
   //    },
   // ]

   console.log("jobs", jobs)
   const onCloseDialog = useCallback(() => {
      setSelectedJob(null)
   }, [])

   if (jobs.length === 0) {
      // no active jobs in ATS
      return null
   }

   return (
      <>
         <Box py={1} display="flex" alignContent="center" alignSelf="center">
            You can still apply to the following Jobs:
         </Box>

         <List sx={styles.list}>
            {jobs.map((job) => (
               <JobItem
                  key={job.id}
                  // @ts-ignore
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

type JobItemProps = {
   job: Job
   handleSelectJob: (job: Job) => void
}

const JobItem = ({ job, handleSelectJob }: JobItemProps) => {
   const { id, name } = job

   const handleClick = useCallback(() => {
      handleSelectJob(job)
   }, [handleSelectJob, job])

   return (
      <ListItem disablePadding key={id} onClick={handleClick}>
         <ListItemButton>
            <ListItemIcon sx={styles.icon}>
               <WorkOutlineOutlinedIcon color="secondary" />
            </ListItemIcon>
            <ListItemText>
               <Typography variant="subtitle1" fontWeight="bold">
                  {name}
               </Typography>
            </ListItemText>
         </ListItemButton>
      </ListItem>
   )
}
export default JobApply
