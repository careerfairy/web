import CreateJobButton from "../../../admin/jobs/components/CreateJobButton"
import { CustomJobStats } from "@careerfairy/shared-lib/customJobs/customJobs"
import React, { FC, useCallback, useMemo } from "react"
import { Box, Divider, Grid, Typography, Stack, ListItem } from "@mui/material"
import { sxStyles } from "../../../../../types/commonTypes"
import { User } from "react-feather"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { useRouter } from "next/router"
import useGroupFromState from "../../../../custom-hook/useGroupFromState"
import JobMenu from "./JobMenu"
import JobSearch from "./JobSearch"

const styles = sxStyles({
   wrapper: {
      mx: { xs: 2, md: 5 },
      my: 2,
   },
   itemWrapper: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      width: "100%",
      p: { md: 3 },
      borderRadius: "16px",
      background: "white",
      border: "1px solid #ECECEC",
   },
   infoWrapper: {
      p: { xs: 2, md: 0 },
   },
   info: {
      display: "flex",
      px: { xs: 1, md: 0 },
      mt: 1,
   },
   title: {
      color: "text.primary",
      fontWeight: "bold",
      fontSize: "20px",
      px: { xs: 1, md: 0 },
   },
   subtitle: {
      fontSize: { xs: "14px", md: "16px" },
      color: "text.secondary",
      overflow: "hidden",
      textOverflow: "ellipsis",
   },
   statsWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "end",
      px: { xs: 1.5, md: 0 },
      pb: { xs: 1.5, md: 0 },
   },
   stats: {
      background: "#FAFAFE",
      border: "#F6F6FA",
      borderRadius: "10px",
      p: { xs: "12px 12px", md: "12px 20px" },
      alignItems: "center",
      width: { xs: "100%", md: "unset" },
      justifyContent: "space-between",
   },
   applications: {
      display: "flex",
      alignItems: "center",

      "& svg": {
         color: "secondary.main",
      },
   },
   mobileHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "end",
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
   editButtonDesktop: {
      display: "flex",
      justifyContent: "end",
   },
   listItem: {
      p: 0,

      "&:hover": {
         cursor: "pointer",
      },
   },
})

type Props = {
   jobsStats: CustomJobStats[]
}
const JobList: FC<Props> = ({ jobsStats }) => {
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
      () => jobsStats.map((jobStats) => jobStats.job),
      [jobsStats]
   )

   return (
      <Box sx={styles.wrapper}>
         <Stack spacing={2} sx={styles.searchWrapper}>
            {isMobile ? <CreateJobButton sx={styles.createButton} /> : null}
            <JobSearch options={jobsOptions} />
         </Stack>

         <Stack spacing={2}>
            {jobsStats.map(({ job, clicks, applicants }) => (
               <ListItem
                  key={job.id}
                  sx={styles.listItem}
                  onClick={() => handleJobClick(job.id)}
               >
                  <Grid key={job.id} container>
                     <Box sx={styles.itemWrapper}>
                        <Grid
                           item
                           xs={12}
                           md={6.5}
                           lg={7}
                           sx={styles.infoWrapper}
                        >
                           <Box sx={styles.mobileHeader}>
                              <Typography variant={"h5"} sx={styles.title}>
                                 {" "}
                                 {job.title}{" "}
                              </Typography>
                              {isMobile ? <JobMenu jobId={job.id} /> : null}
                           </Box>

                           <Stack
                              spacing={isMobile ? 1 : 2}
                              sx={styles.info}
                              direction={isMobile ? "column" : "row"}
                              divider={
                                 <Divider
                                    orientation={
                                       isMobile ? "horizontal" : "vertical"
                                    }
                                    flexItem
                                 />
                              }
                           >
                              <Typography
                                 variant={"subtitle1"}
                                 sx={styles.subtitle}
                                 minWidth={"90px"}
                              >
                                 {job.jobType}
                              </Typography>

                              <Typography
                                 variant={"subtitle1"}
                                 sx={styles.subtitle}
                              >
                                 {formatJobPostingUrl(job.postingUrl)}
                              </Typography>
                           </Stack>
                        </Grid>

                        <Grid
                           item
                           xs={12}
                           md={5}
                           lg={4.5}
                           sx={styles.statsWrapper}
                        >
                           <Stack
                              spacing={2}
                              sx={styles.stats}
                              direction="row"
                              divider={
                                 <Divider orientation="vertical" flexItem />
                              }
                           >
                              <Typography
                                 variant={"subtitle1"}
                                 color={"text.secondary"}
                              >
                                 {clicks} Clicks
                              </Typography>

                              <Box sx={styles.applications}>
                                 <User size={24} />
                                 <Typography
                                    variant={"subtitle1"}
                                    color={"secondary.main"}
                                    ml={1}
                                 >
                                    {applicants} Applications
                                 </Typography>
                              </Box>
                           </Stack>
                        </Grid>

                        {isMobile ? null : (
                           <Grid item xs={0.5} sx={styles.editButtonDesktop}>
                              <JobMenu jobId={job.id} />
                           </Grid>
                        )}
                     </Box>
                  </Grid>
               </ListItem>
            ))}
         </Stack>
      </Box>
   )
}

const formatJobPostingUrl = (postingUrl: string): string => {
   const withoutProtocol = postingUrl.split("://")[1]
   return withoutProtocol ? withoutProtocol : postingUrl
}

export default JobList
