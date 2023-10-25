import React, { Fragment, useEffect, useState } from "react"
import { useRouter } from "next/router"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import {
   Button,
   Card,
   CardActions,
   CardContent,
   CardMedia,
   Grid,
   IconButton,
   Menu,
   MenuItem,
   Typography,
} from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import AreYouSureModal from "../../../materialUI/GlobalModals/AreYouSureModal"
import Skeleton from "@mui/material/Skeleton"
import Link from "next/link"
import Fade from "@stahl.luke/react-reveal/Fade"
import {
   getMaxLineStyles,
   getResizedUrl,
} from "../../helperFunctions/HelperFunctions"
import { groupRepo } from "../../../data/RepositoryInstances"

const useStyles = makeStyles((theme) => ({
   root: {
      maxWidth: 345,
   },
   media: {
      display: "flex",
      justifyContent: "center",
      padding: "1.5em 1em 1em 1em",
      height: "120px",
      background: theme.palette.common.white,
   },
   card: {
      flex: 1,
   },
   actions: {
      justifyContent: "center",
   },
   title: {
      ...getMaxLineStyles(2),
   },
   description: {
      ...getMaxLineStyles(3),
   },
}))

const CurrentGroup = ({
   userData,
   group,
   isAdmin = false,
   groupId = undefined,
   hideMenu = false,
}) => {
   const { push } = useRouter()
   const firebase = useFirebaseService()
   const [open, setOpen] = useState(false)
   const [localGroup, setLocalGroup] = useState({})
   const [noGroup, setNoGroup] = useState(false)
   const [anchorEl, setAnchorEl] = useState(null)
   const [leaving, setLeaving] = useState(false)
   const [deleting, setDeleting] = useState(false)
   const [deleted, setDeleted] = useState(false)
   const [leaveGroup, setLeaveGroup] = useState(false)

   useEffect(() => {
      if (group) {
         setLocalGroup(group)
      }
   }, [group])

   useEffect(() => {
      if (!group) {
         const unsubscribe = firebase.listenToCareerCenterById(
            groupId,
            (querySnapshot) => {
               if (querySnapshot) {
                  if (querySnapshot.data()) {
                     let careerCenter = querySnapshot.data()
                     careerCenter.id = querySnapshot.id
                     setLocalGroup(careerCenter)
                  } else {
                     setNoGroup(true)
                  }
               }
            }
         )
         return () => unsubscribe()
      }
   }, [])

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget)
   }

   const handleClose = () => {
      setAnchorEl(null)
   }

   const classes = useStyles()
   const router = useRouter()

   const handleDeleteCareerCenter = async () => {
      try {
         setDeleting(true)
         await firebase.deleteCareerCenter(group.id)
         await firebase.deleteCareerCenterFromAllUsers(group.id)
         setDeleting(false)
         setOpen(false)
      } catch (e) {
         setDeleting(false)
         console.log("error in career center deletion", e)
      }
   }
   const handleLeaveGroup = async () => {
      try {
         setLeaving(true)
         await groupRepo.deleteUserGroupData(userData.userEmail, group.id)
         setDeleted(true)
         setLeaving(false)
         setOpen(false)
      } catch (e) {
         setLeaving(false)
         console.log("error in leaving", e)
      }
   }

   if (noGroup || deleted) {
      return null
   }

   const menuItems = []

   if (!isAdmin) {
      menuItems.push(
         {
            handleClick: () =>
               router.push(
                  `/next-livestreams?careerCenterId=${localGroup.groupId}`
               ),
            label: "Group Page",
         },
         {
            handleClick: () => setOpen(true),
            label: "Leave Group",
            handleMouseEnter: () => setLeaveGroup(true),
         }
      )
   }
   if (isAdmin) {
      menuItems.push(
         {
            handleClick: () => push(`/group/${localGroup.id}/admin`),
            label: "Admin group",
         },
         {
            handleClick: () => {
               setOpen(true)
               handleClose()
            },
            label: "Delete group",
         }
      )
   }

   return (
      <Fragment key={localGroup.id}>
         <Grid item xs={12} sm={6} lg={4}>
            <Fade>
               <Card variant={"outlined"} style={{ position: "relative" }}>
                  {!localGroup.logoUrl ? (
                     <Skeleton
                        className={classes.media}
                        animation="wave"
                        variant="rectangular"
                     />
                  ) : (
                     <CardMedia className={classes.media}>
                        <img
                           src={getResizedUrl(localGroup.logoUrl, "sm")}
                           style={{
                              objectFit: "contain",
                              maxWidth: "80%",
                           }}
                           alt={`${localGroup.universityName} logo`}
                        />
                     </CardMedia>
                  )}
                  <CardContent style={{ height: "115px" }}>
                     <Typography
                        align="center"
                        gutterBottom
                        variant="h5"
                        component="h2"
                        className={classes.title}
                     >
                        {localGroup.universityName}
                     </Typography>
                     <Typography
                        align="center"
                        variant="body2"
                        className={classes.description}
                        color="textSecondary"
                        component="p"
                     >
                        {localGroup.description}
                     </Typography>
                  </CardContent>
                  {hideMenu ? null : (
                     <IconButton
                        style={{ position: "absolute", top: 10, right: 10 }}
                        onClick={handleClick}
                        size="small"
                     >
                        <MoreVertIcon />
                     </IconButton>
                  )}
                  <CardActions className={classes.actions}>
                     {!isAdmin && (
                        <Link href={`/next-livestreams/${localGroup.groupId}`}>
                           <Button fullWidth size="large" color="primary">
                              View Calendar
                           </Button>
                        </Link>
                     )}
                     {isAdmin ? (
                        <a
                           // Not using nextjs/Link on purpose, we want to trigger a full page
                           // refresh, to ensure we disable gtm completely
                           href={`/group/${localGroup.id}/admin`}
                        >
                           <Button fullWidth size="large" color="primary">
                              View Admin Page
                           </Button>
                        </a>
                     ) : null}
                     {hideMenu ? null : (
                        <Menu
                           id="simple-menu"
                           anchorEl={anchorEl}
                           keepMounted
                           open={Boolean(anchorEl)}
                           onClose={handleClose}
                        >
                           {menuItems.map((item) => {
                              return (
                                 <MenuItem
                                    key={item.label}
                                    onMouseEnter={item.handleMouseEnter}
                                    onClick={item.handleClick}
                                 >
                                    {item.label}
                                 </MenuItem>
                              )
                           })}
                        </Menu>
                     )}
                  </CardActions>
               </Card>
            </Fade>
         </Grid>
         <AreYouSureModal
            open={open}
            loading={leaveGroup ? leaving : deleting}
            handleClose={() => setOpen(false)}
            handleConfirm={
               leaveGroup ? handleLeaveGroup : handleDeleteCareerCenter
            }
            title="Warning"
            message={
               leaveGroup
                  ? `Are you sure you want to leave ${localGroup.universityName}'s group?`
                  : `Are you sure you want to delete ${localGroup.universityName}? You wont be able to revert changes`
            }
         />
      </Fragment>
   )
}

export default CurrentGroup
