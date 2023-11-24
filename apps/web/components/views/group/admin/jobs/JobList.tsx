import CreateJobButton from "../../../admin/jobs/components/CreateJobButton"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import React, { FC, MouseEvent, useCallback } from "react"
import {
   Box,
   Divider,
   Grid,
   Typography,
   Stack,
   IconButton,
   MenuItem,
   ListItem,
} from "@mui/material"
import { sxStyles } from "../../../../../types/commonTypes"
import { Trash2 as DeleteIcon, User } from "react-feather"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import EditIcon from "@mui/icons-material/Edit"
import BrandedMenu from "../../../common/inputs/BrandedMenu"
import useMenuState from "../../../../custom-hook/useMenuState"
import { useDispatch } from "react-redux"
import {
   openDeleteJobDialogOpen,
   openJobFormDialog,
} from "../../../../../store/reducers/adminJobsReducer"
import useIsMobile from "../../../../custom-hook/useIsMobile"

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
      p: { xs: 3, md: 0 },
      pb: { xs: 2, md: 0 },
   },
   info: {
      display: "flex",
      mt: 1,
   },
   subtitle: {
      fontSize: "16px",
      color: "text.secondary",
   },
   statsWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "end",
      px: { xs: 1.5, md: 0 },
      pb: { xs: 1.5, md: 0 },
   },
   stats: {
      background: "var(--white-white-300, #FAFAFE)",
      border: "1px solid var(--white-white-400, #F6F6FA)",
      borderRadius: "10px",
      p: { xs: "12px 12px", md: "12px 20px" },
      alignItems: "center",
      width: "100%",
      justifyContent: "space-between",
   },
   applications: {
      display: "flex",
      alignItems: "center",

      "& svg": {
         color: "secondary.main",
      },
   },
   deleteIcon: {
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
      py: { xs: 2 },
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
   jobs: PublicCustomJob[]
}
const JobList: FC<Props> = ({ jobs }) => {
   const isMobile = useIsMobile()

   const handleJobOpen = (jobId: string) => {
      console.log(`open job ${jobId} details component `)
   }

   return (
      <Box sx={styles.wrapper}>
         <Stack spacing={2} sx={styles.searchWrapper}>
            {isMobile ? <CreateJobButton sx={styles.createButton} /> : null}

            <Box>Search component</Box>
         </Stack>

         <Stack spacing={2}>
            {jobs.map((job) => (
               <ListItem
                  key={job.id}
                  sx={styles.listItem}
                  onClick={() => handleJobOpen(job.id)}
               >
                  <Grid key={job.id} container>
                     <Box sx={styles.itemWrapper}>
                        <Grid item xs={12} md={8} sx={styles.infoWrapper}>
                           <Box sx={styles.mobileHeader}>
                              <Typography
                                 variant={"h5"}
                                 color={"text.primary"}
                                 fontWeight="bold"
                              >
                                 {" "}
                                 {job.title}{" "}
                              </Typography>
                              {isMobile ? (
                                 <EditButtonComponent jobId={job.id} />
                              ) : null}
                           </Box>

                           <Stack
                              spacing={2}
                              sx={styles.info}
                              direction="row"
                              divider={
                                 <Divider orientation="vertical" flexItem />
                              }
                           >
                              <Typography
                                 variant={"subtitle1"}
                                 sx={styles.subtitle}
                                 minWidth={"90px"}
                              >
                                 {job.jobType}{" "}
                              </Typography>

                              <Typography
                                 variant={"subtitle1"}
                                 sx={styles.subtitle}
                              >
                                 {" "}
                                 {job.postingUrl}{" "}
                              </Typography>
                           </Stack>
                        </Grid>

                        <Grid item xs={12} md={3.5} sx={styles.statsWrapper}>
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
                                 {" "}
                                 23 Clicks{" "}
                              </Typography>

                              <Box sx={styles.applications}>
                                 <User size={24} />
                                 <Typography
                                    variant={"subtitle1"}
                                    color={"secondary.main"}
                                    ml={1}
                                 >
                                    {" "}
                                    12 Applications{" "}
                                 </Typography>
                              </Box>
                           </Stack>
                        </Grid>

                        {isMobile ? null : (
                           <Grid item xs={0.5} sx={styles.editButtonDesktop}>
                              <EditButtonComponent jobId={job.id} />
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

type EditComponentProps = {
   jobId: string
}
const EditButtonComponent: FC<EditComponentProps> = ({ jobId }) => {
   const { anchorEl, handleClick, handleClose, open } = useMenuState()
   const dispatch = useDispatch()

   const handleRemoveJob = useCallback(
      (event: MouseEvent<HTMLElement>) => {
         event.stopPropagation()
         dispatch(openDeleteJobDialogOpen(jobId))
         handleClose()
      },
      [dispatch, handleClose, jobId]
   )

   const handleEditJob = useCallback(
      (event: MouseEvent<HTMLElement>) => {
         event.stopPropagation()
         dispatch(openJobFormDialog(jobId))
         handleClose()
      },
      [dispatch, handleClose, jobId]
   )

   const menuClick = useCallback(
      (event: MouseEvent<HTMLElement>) => {
         event.stopPropagation()
         handleClick(event)
      },
      [handleClick]
   )

   return (
      <Box>
         <IconButton onClick={menuClick} size={"small"}>
            <MoreVertIcon color={"secondary"} />
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
            <MenuItem onClick={handleEditJob}>
               <EditIcon sx={{ height: 16 }} color="inherit" />
               Edit job opening details
            </MenuItem>
            <Divider />
            <MenuItem sx={styles.deleteMenuItem} onClick={handleRemoveJob}>
               <Box sx={styles.deleteIcon}>
                  <DeleteIcon />
               </Box>
               Remove job opening
            </MenuItem>
         </BrandedMenu>
      </Box>
   )
}

export default JobList
