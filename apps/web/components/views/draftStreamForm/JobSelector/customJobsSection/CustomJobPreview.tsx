import {
   Box,
   Button,
   Collapse,
   Divider,
   Grid,
   IconButton,
   MenuItem,
   Stack,
   Typography,
} from "@mui/material"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import { sxStyles } from "../../../../../types/commonTypes"
import DateUtil from "../../../../../util/DateUtil"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import React, { useCallback, useMemo, useState } from "react"
import SanitizedHTML from "../../../../util/SanitizedHTML"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import Link from "../../../common/Link"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import useMenuState from "../../../../custom-hook/useMenuState"
import BrandedMenu from "../../../common/inputs/BrandedMenu"
import CustomJobCreateOrEditFrom from "./CustomJobCreateOrEditFrom"
import EditIcon from "@mui/icons-material/Edit"
import { Trash2 as DeleteIcon } from "react-feather"

const styles = sxStyles({
   wrapper: {
      p: 3,
      mt: 3,
      border: "1px solid #BCBCBC",
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
   collapseBtn: {
      p: 0,
      mt: 2,
      textTransform: "none",
      fontSize: "16px",
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
   },
   description: {
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "27px",
   },
})

const MAX_LENGTH_TO_SHOW_COLLAPSE_BUTTONS = 290

type Props = {
   job: PublicCustomJob
   handleRemoveJob: (jobId: string) => void
   handleEditJob: (job: PublicCustomJob) => Promise<void>
}
const CustomJobPreview = ({ job, handleRemoveJob, handleEditJob }: Props) => {
   const { anchorEl, handleClick, handleClose, open } = useMenuState()

   const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(true)
   const [editMode, setEditMode] = useState(false)

   const showCollapse = useMemo(
      () => job.description.length >= MAX_LENGTH_TO_SHOW_COLLAPSE_BUTTONS,
      [job.description]
   )

   const toggle = useCallback(() => {
      setIsDescriptionCollapsed((prev) => !prev)
   }, [])

   const handleClickEdit = useCallback(() => {
      setEditMode(true)
   }, [])

   const handleCloseEditMode = useCallback(() => {
      setEditMode(false)
      handleClose()
   }, [handleClose])

   const handleUpdateJob = useCallback(
      async (job: PublicCustomJob) => {
         await handleEditJob(job)

         setEditMode(false)
         handleClose()
      },
      [handleClose, handleEditJob]
   )

   return editMode ? (
      <CustomJobCreateOrEditFrom
         job={job}
         handleCancelCreateNewJob={handleCloseEditMode}
         handleCreateNewJob={handleUpdateJob}
      />
   ) : (
      <Box sx={styles.wrapper}>
         <Grid container>
            <Grid xs={12} item sx={styles.titleSection}>
               <Typography variant="h5" fontWeight="bold">
                  {job.title}
               </Typography>

               <Box>
                  <IconButton onClick={handleClick} size="small">
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
                  >
                     <MenuItem onClick={handleClickEdit}>
                        <EditIcon sx={{ height: 16 }} color="inherit" />
                        Edit details
                     </MenuItem>
                     <Divider />
                     <MenuItem
                        sx={styles.deleteMenuItem}
                        onClick={() => handleRemoveJob(job.id)}
                     >
                        <Box sx={styles.deleteIcon}>
                           <DeleteIcon />
                        </Box>
                        Remove job opening
                     </MenuItem>
                  </BrandedMenu>
               </Box>
            </Grid>

            <Grid xs={12} item sx={styles.infoSection} mt={2}>
               <Stack spacing={2} direction={"row"}>
                  {job.salary ? (
                     <>
                        <Typography variant="body1" fontSize={"inherit"}>
                           {job.salary}
                        </Typography>
                        <Divider orientation="vertical" />
                     </>
                  ) : null}

                  <Typography variant="body1" fontSize={"inherit"}>
                     {job.jobType}
                  </Typography>

                  {job.deadline ? (
                     <>
                        <Divider orientation="vertical" />
                        <Typography variant="body1" fontSize={"inherit"}>
                           {" "}
                           {DateUtil.formatDateToString(
                              job.deadline.toDate()
                           )}{" "}
                        </Typography>
                     </>
                  ) : null}
               </Stack>

               <Typography variant="body1" fontSize={"inherit"} mt={1}>
                  <Link
                     href={getPostingUrl(job.postingUrl)}
                     color={"inherit"}
                     underline={"none"}
                     target={"_blank"}
                  >
                     {job.postingUrl}
                  </Link>
               </Typography>
            </Grid>

            <Grid xs={12} item mt={4}>
               <Collapse in={!isDescriptionCollapsed} collapsedSize={75}>
                  <SanitizedHTML
                     sx={styles.description}
                     htmlString={job.description}
                  />
               </Collapse>
               {showCollapse ? (
                  <Box display="flex" justifyContent="start">
                     {isDescriptionCollapsed ? (
                        <Button
                           variant="text"
                           color="secondary"
                           sx={styles.collapseBtn}
                           endIcon={<ExpandMoreIcon />}
                           onClick={toggle}
                        >
                           View more
                        </Button>
                     ) : null}

                     {!isDescriptionCollapsed && (
                        <Button
                           variant="text"
                           color="secondary"
                           sx={styles.collapseBtn}
                           startIcon={<ExpandLessIcon />}
                           onClick={toggle}
                        >
                           View less
                        </Button>
                     )}
                  </Box>
               ) : null}
            </Grid>
         </Grid>
      </Box>
   )
}

const getPostingUrl = (postingUrl: string): string => {
   if (postingUrl.indexOf("http") === 0) {
      return postingUrl
   } else {
      return `https://${postingUrl}`
   }
}
export default CustomJobPreview
