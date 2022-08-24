import { UserJobApplicationDocument } from "@careerfairy/shared-lib/dist/users"
import Card from "@mui/material/Card"
import {
   CardContent,
   CardHeader,
   ListItemIcon,
   ListItemText,
   Menu,
   MenuItem,
   Typography,
} from "@mui/material"
import IconButton from "@mui/material/IconButton"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import React, { useCallback, useMemo, useState } from "react"
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../types/commonTypes"
import Stack from "@mui/material/Stack"
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded"
import DateUtil from "../../../../util/DateUtil"
import Skeleton from "@mui/material/Skeleton"

const styles = sxStyles({
   title: {
      fontWeight: 600,
      lineHeight: "23px",
   },
   subtitle: {
      fontWeight: 400,
      fontSize: 18,
   },
   detailWrapper: {
      display: "flex",
      alignItems: "center",
   },
   icon: {
      mr: 1,
   },
})

type JobApplicationCardProps = {
   jobApplication: UserJobApplicationDocument
}
export const JobApplicationCard = ({
   jobApplication,
}: JobApplicationCardProps) => {
   const [anchorEl, setAnchorEl] = useState(null)
   const {
      userData: { userEmail },
   } = useAuth()
   const handleCloseMenu = useCallback(() => setAnchorEl(null), [])

   const handleOpenMenu = useCallback((event) => {
      setAnchorEl(event.currentTarget)
   }, [])

   const handleDeleteApplication = useCallback(async () => {
      try {
      } catch (e) {
         console.error(e)
      }
   }, [userEmail, jobApplication])

   const detailItems = useMemo<ApplicationDetailItem[]>(
      () => [
         {
            icon: <TaskAltRoundedIcon color={"inherit"} sx={styles.icon} />,
            title: `Date applied ${DateUtil.getJobApplicationDate(
               jobApplication.date.toDate()
            )}`,
         },
      ],
      [jobApplication.date]
   )

   return (
      <Card>
         <CardHeader
            sx={{
               alignItems: "start",
            }}
            title={
               <Typography sx={styles.title} variant="h4" gutterBottom>
                  {jobApplication.job.name}
               </Typography>
            }
            subheader={
               <Typography sx={styles.subtitle} variant="body1">
                  {`Associated to ${jobApplication.livestream.title} event`}
               </Typography>
            }
            action={
               <>
                  <IconButton aria-label="settings" onClick={handleOpenMenu}>
                     <MoreHorizIcon />
                  </IconButton>
                  <Menu
                     id="card-options-menu"
                     anchorEl={anchorEl}
                     open={Boolean(anchorEl)}
                     onClose={handleCloseMenu}
                     anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                     }}
                  >
                     <MenuItem onClick={handleDeleteApplication}>
                        <ListItemIcon>
                           <DeleteOutlineOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                     </MenuItem>
                  </Menu>
               </>
            }
         />
         <CardContent>
            <Stack spacing={2}>
               {detailItems.map((detailItem) => (
                  <ApplicationDetail key={detailItem.title} {...detailItem} />
               ))}
            </Stack>
         </CardContent>
      </Card>
   )
}

export const JobApplicationCardSkeleton = () => {
   return (
      <Card>
         <CardHeader
            title={
               <Typography sx={styles.title} variant="h4" gutterBottom>
                  <Skeleton variant={"text"} width={"50%"} />
               </Typography>
            }
            action={<Skeleton width={25} height={15} />}
            subheader={
               <Typography sx={styles.subtitle} variant="body1">
                  <Skeleton variant="text" width={"80%"} />
               </Typography>
            }
         />
         <CardContent>
            <Stack direction={"row"} spacing={2}>
               <Skeleton variant={"text"} height={25} width={"40%"} />
            </Stack>
         </CardContent>
      </Card>
   )
}

type ApplicationDetailItem = {
   icon: React.ReactElement
   title: string
}
const ApplicationDetail = ({ icon, title }: ApplicationDetailItem) => {
   return (
      <Stack
         sx={{
            color: "text.secondary",
         }}
         direction={"row"}
         alignItems={"center"}
      >
         {icon}
         <Typography variant="body1">{title}</Typography>
      </Stack>
   )
}
