import {
   Box,
   Divider,
   Grid,
   IconButton,
   MenuItem,
   Stack,
   Typography,
} from "@mui/material"
import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { X as DeleteIcon, Edit2 as EditIcon } from "react-feather"
import useMenuState from "components/custom-hook/useMenuState"
import BrandedMenu from "components/views/common/inputs/BrandedMenu"
import CollapsableText from "components/views/common/inputs/CollapsableText"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import Link from "components/views/common/Link"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import useIsAtsJob from "components/custom-hook/useIsAtsJob"

const styles = sxStyles({
   wrapper: {
      p: 3,
      mt: 3,
      border: "1px solid #ECECEC",
      borderRadius: 2,
   },
   titleSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
   infoSection: {
      display: "flex",
      flexDirection: "column",
      color: "#7C7C7C",
      fontSize: 16,
   },
   icon: {
      display: "flex",
      alignSelf: "center",
      height: "16px",
      width: "16px",
      mr: 1,

      "& svg": {
         height: 16,
      },
   },
   deleteMenuItem: {
      color: "error.main",
      py: "12px",
   },
   menu: {
      "& .MuiPaper-root": {
         borderRadius: "6px",
      },
   },
   jobInfo: {
      fontSize: { xs: "14px", md: "16px" },
   },
   postingUrl: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      mt: { xs: 2, md: 1 },
      fontSize: "inherit",
   },
   description: {
      fontSize: "16px",
      color: "var(--Neutral-Neutral---700, #5C5C6A)",
   },
})

type Props = {
   job: PublicCustomJob | Job
   handleRemoveJob: (jobId: string) => void
   handleEditJob: (job: PublicCustomJob) => void
}

const JobCardPreview = ({ job, handleRemoveJob, handleEditJob }: Props) => {
   const { anchorEl, handleClick, handleClose, open } = useMenuState()
   const isAtsJob = useIsAtsJob(job)

   const handleClickEdit = () => {
      handleEditJob(job as PublicCustomJob)
      handleClose()
   }

   return (
      <Box sx={styles.wrapper}>
         <Grid container>
            <Grid xs={12} item sx={styles.titleSection}>
               <Typography variant="h5" fontWeight="bold">
                  {isAtsJob ? job.name : job.title}
               </Typography>

               {!isAtsJob && (
                  <Box>
                     <IconButton onClick={handleClick} size="small">
                        <MoreVertIcon />
                     </IconButton>
                     <BrandedMenu
                        onClose={handleClose}
                        anchorEl={anchorEl}
                        open={open}
                        anchorOrigin={{
                           vertical: "bottom",
                           horizontal: "right",
                        }}
                        transformOrigin={{
                           vertical: "top",
                           horizontal: "right",
                        }}
                        sx={styles.menu}
                     >
                        <MenuItem onClick={handleClickEdit}>
                           <Box sx={styles.icon}>
                              <EditIcon size="1rem" color="#6B6B7F" />
                           </Box>
                           Edit details
                        </MenuItem>
                        <Divider />
                        <MenuItem
                           sx={styles.deleteMenuItem}
                           onClick={() => handleRemoveJob(job.id)}
                        >
                           <Box sx={styles.icon}>
                              <DeleteIcon />
                           </Box>
                           Unlink job opening
                        </MenuItem>
                     </BrandedMenu>
                  </Box>
               )}
            </Grid>

            {!isAtsJob && (
               <Grid xs={12} item sx={styles.infoSection} mt={2}>
                  <Stack spacing={2} direction={"row"}>
                     {job.salary ? (
                        <>
                           <Typography sx={styles.jobInfo}>
                              {job.salary}
                           </Typography>
                           <Divider orientation="vertical" />
                        </>
                     ) : null}

                     <Typography sx={styles.jobInfo}>{job.jobType}</Typography>

                     {job.deadline ? (
                        <>
                           <Divider orientation="vertical" />
                           <Typography sx={styles.jobInfo}>
                              {DateUtil.formatDateToString(
                                 job.deadline.toDate()
                              )}
                           </Typography>
                        </>
                     ) : null}
                  </Stack>

                  <Typography
                     variant="body1"
                     sx={[styles.jobInfo, styles.postingUrl]}
                  >
                     <Link
                        href={job.postingUrl}
                        color={"inherit"}
                        underline={"none"}
                        target={"_blank"}
                     >
                        {job.postingUrl}
                     </Link>
                  </Typography>
               </Grid>
            )}

            <Grid xs={12} item mt={4}>
               <CollapsableText
                  text={job.description}
                  textStyle={styles.description}
                  collapsedSize={80}
               />
            </Grid>
         </Grid>
      </Box>
   )
}

export default JobCardPreview
