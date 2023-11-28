import CreateJobButton from "../../../admin/jobs/components/CreateJobButton"
import {
   CustomJob,
   PublicCustomJob,
} from "@careerfairy/shared-lib/groups/customJobs"
import React, { FC, MouseEvent, useCallback, useMemo, useState } from "react"
import {
   Box,
   Divider,
   Grid,
   Typography,
   Stack,
   IconButton,
   MenuItem,
   ListItem,
   Card,
} from "@mui/material"
import { sxStyles } from "../../../../../types/commonTypes"
import { Search as FindIcon, Trash2 as DeleteIcon, User } from "react-feather"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import EditIcon from "@mui/icons-material/Edit"
import BrandedMenu from "../../../common/inputs/BrandedMenu"
import useMenuState from "../../../../custom-hook/useMenuState"
import { useDispatch } from "react-redux"
import {
   openDeleteJobDialogOpen,
   openJobsDialog,
} from "../../../../../store/reducers/adminJobsReducer"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import AutocompleteSearch from "../../../common/AutocompleteSearch"
import { useRouter } from "next/router"
import { dynamicSort } from "../../../../helperFunctions/HelperFunctions"
import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete/Autocomplete"
import { getParts } from "../../../../util/search"
import RenderParts from "../../../common/search/RenderParts"
import useGroupFromState from "../../../../custom-hook/useGroupFromState"

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
   search: {
      display: "flex",
      alignItems: "center",
      height: "40px",
      borderRadius: "20px",
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
   editWrapper: {
      position: "absolute",
      right: "12px",
      top: "16px",
   },
})

type Props = {
   jobs: CustomJob[]
}
const JobList: FC<Props> = ({ jobs }) => {
   const isMobile = useIsMobile()
   const { push } = useRouter()
   const { group } = useGroupFromState()
   const [inputValue, setInputValue] = useState("")

   const handleJobClick = useCallback(
      (jobId: string) => {
         void push(`/group/${group.groupId}/admin/jobs/${jobId}`)
      },
      [group.groupId, push]
   )

   const handleChange = useCallback(
      (newValue: PublicCustomJob | null) =>
         push(`/group/${group.groupId}/admin/jobs/${newValue.id}`),
      [group.groupId, push]
   )

   const sortedJobs = useMemo(
      () =>
         jobs
            .map((job) => ({
               ...job,
               createdAt: job.createdAt?.toDate(),
            }))
            .sort(dynamicSort("createdAt", "asc")),
      [jobs]
   )

   return (
      <Box sx={styles.wrapper}>
         <Stack spacing={2} sx={styles.searchWrapper}>
            {isMobile ? <CreateJobButton sx={styles.createButton} /> : null}

            <Card sx={styles.search}>
               <AutocompleteSearch
                  id="jobs-search"
                  minCharacters={3}
                  inputValue={inputValue}
                  handleChange={handleChange}
                  options={sortedJobs}
                  renderOption={renderOption}
                  isOptionEqualToValue={isOptionEqualToValue}
                  getOptionLabel={getOptionLabel}
                  setInputValue={setInputValue}
                  noOptionsText="No jobs found"
                  placeholderText="Search"
                  inputStartIcon={<FindIcon />}
               />
            </Card>
         </Stack>

         <Stack spacing={2}>
            {sortedJobs.map((job) => (
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
                              {isMobile ? (
                                 <EditButtonComponent jobId={job.id} />
                              ) : null}
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
                                 {" "}
                                 {job.clicks} Clicks{" "}
                              </Typography>

                              <Box sx={styles.applications}>
                                 <User size={24} />
                                 <Typography
                                    variant={"subtitle1"}
                                    color={"secondary.main"}
                                    ml={1}
                                 >
                                    {" "}
                                    {job.applicants.length} Applications{" "}
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

const isOptionEqualToValue = (
   option: PublicCustomJob,
   value: PublicCustomJob
) => option.id === value.id

const getOptionLabel = (option: PublicCustomJob) => option.title

const renderOption = (
   props: React.HTMLAttributes<HTMLLIElement>,
   option: PublicCustomJob,
   state: AutocompleteRenderOptionState
) => {
   const titleParts = getParts(option.title, state.inputValue)

   return (
      <Box {...props} component={"li"} key={option.id}>
         <RenderParts parts={titleParts} />
      </Box>
   )
}

const formatJobPostingUrl = (postingUrl: string): string => {
   const withoutProtocol = postingUrl.split("://")[1]
   return withoutProtocol ? withoutProtocol : postingUrl
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
         dispatch(openJobsDialog(jobId))
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

   const handleCloseMenu = useCallback(
      (event: MouseEvent<HTMLElement>) => {
         event.stopPropagation()
         handleClose()
      },
      [handleClose]
   )

   return (
      <Box sx={styles.editWrapper}>
         <IconButton onClick={menuClick} size={"small"}>
            <MoreVertIcon color={"secondary"} />
         </IconButton>
         <BrandedMenu
            onClose={handleCloseMenu}
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
