import React, { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/router";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { useFirebaseService, withFirebase } from "context/firebase/FirebaseServiceContext";
import {
   Card,
   CardContent,
   CardMedia,
   Typography,
   Button,
   Grow,
   IconButton,
   Grid,
   CardActions,
   Menu,
   MenuItem,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AreYouSureModal from "../../../materialUI/GlobalModals/AreYouSureModal";
import Skeleton from "@material-ui/lab/Skeleton";
import GroupJoinModal from "./GroupJoinModal";
import Link from "next/link";
import Fade from "@stahl.luke/react-reveal/Fade";
import { getResizedUrl } from "../../helperFunctions/HelperFunctions";

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
}));

const CurrentGroup = ({ userData, group, isAdmin, groupId }) => {
   const { push } = useRouter();
   const firebase = useFirebaseService();
   const [open, setOpen] = useState(false);
   const [localGroup, setLocalGroup] = useState({});
   const [noGroup, setNoGroup] = useState(false);
   const [anchorEl, setAnchorEl] = useState(null);
   const [leaving, setLeaving] = useState(false);
   const [deleting, setDeleting] = useState(false);
   const [openJoinModal, setOpenJoinModal] = useState(false);
   const [leaveGroup, setLeaveGroup] = useState(false);

   useEffect(() => {
      if (group) {
         setLocalGroup(group);
      }
   }, [group]);

   useEffect(() => {
      if (!group) {
         const unsubscribe = firebase.listenToCareerCenterById(
            groupId,
            (querySnapshot) => {
               if (querySnapshot) {
                  if (querySnapshot.data()) {
                     let careerCenter = querySnapshot.data();
                     careerCenter.id = querySnapshot.id;
                     setLocalGroup(careerCenter);
                  } else {
                     setNoGroup(true);
                  }
               }
            }
         );
         return () => unsubscribe();
      }
   }, []);

   const handleCloseJoinModal = () => {
      setOpenJoinModal(false);
   };
   const handleOpenJoinModal = () => {
      setOpenJoinModal(true);
      setAnchorEl(null);
   };

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

   const classes = useStyles();
   const router = useRouter();

   const handleDeleteCareerCenter = async () => {
      try {
         setDeleting(true);
         await firebase.deleteCareerCenter(group.id);
         await firebase.deleteCareerCenterFromAllUsers(group.id);
         setDeleting(false);
         setOpen(false);
      } catch (e) {
         setDeleting(false);
         console.log("error in career center deletion", e);
      }
   };
   const handleLeaveGroup = async () => {
      try {
         setLeaving(true);
         const targetGroupId = localGroup.id;
         const filteredArrayOfGroups = userData.registeredGroups.filter(
            (group) => group.groupId !== targetGroupId
         );
         const arrayOfGroupIds = filteredArrayOfGroups.map(
            (obj) => obj.groupId
         );
         const userId = userData.id || userData.userEmail;
         await firebase.setgroups(
            userId,
            arrayOfGroupIds,
            filteredArrayOfGroups
         );
         setLeaving(false);
         setOpen(false);
      } catch (e) {
         setLeaving(false);
         console.log("error in leaving", e);
      }
   };

   if (noGroup) {
      return null;
   }

   const menuItems = [];

   if (!isAdmin) {
      menuItems.push(
         {
            onClick: () =>
               router.push(
                  `/next-livestreams?careerCenterId=${localGroup.groupId}`
               ),
            label: "Group Page",
         },
         {
            onClick: () => setOpen(true),
            label: "Leave Group",
            onMouseEnter: () => setLeaveGroup(true),
         }
      );
      if (localGroup.categories) {
         menuItems.push({
            onClick: () => handleOpenJoinModal(),
            label: "Update Categories",
         });
      }
   }
   if (isAdmin) {
      menuItems.push(
         {
            onClick: () => push(`/group/${localGroup.id}/admin`),
            label: "Admin group",
         },
         {
            onClick: () => {
               setOpen(true);
               handleClose();
            },
            label: "Delete group",
         }
      );
   }

   return (
      <Fragment key={localGroup.id}>
         <Grid item xs={12} sm={6} md={4} lg={4}>
            <Fade>
               <Card style={{ position: "relative" }}>
                  {!localGroup.logoUrl ? (
                     <Skeleton
                        className={classes.media}
                        animation="wave"
                        variant="rect"
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
                     >
                        {localGroup.universityName}
                     </Typography>
                     <Typography
                        align="center"
                        variant="body2"
                        color="textSecondary"
                        component="p"
                     >
                        {localGroup.description}
                     </Typography>
                  </CardContent>
                  <IconButton
                     style={{ position: "absolute", top: 10, right: 10 }}
                     onClick={handleClick}
                     size="small"
                  >
                     <MoreVertIcon />
                  </IconButton>
                  <CardActions>
                     {!isAdmin && (
                        <Link href={`next-livestreams/${localGroup.groupId}`}>
                           <Button
                              component="a"
                              fullWidth
                              size="large"
                              color="primary"
                           >
                              View Calendar
                           </Button>
                        </Link>
                     )}
                     {isAdmin && (
                        <Link href={`/group/${localGroup.id}/admin`}>
                           <Button
                              component="a"
                              fullWidth
                              size="large"
                              color="primary"
                           >
                              View Admin Page
                           </Button>
                        </Link>
                     )}
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
                                 onMouseEnter={item.onMouseEnter}
                                 onClick={item.onClick}
                              >
                                 {item.label}
                              </MenuItem>
                           );
                        })}
                     </Menu>
                  </CardActions>
               </Card>
            </Fade>
         </Grid>
         <GroupJoinModal
            fromProfile={true}
            open={openJoinModal}
            group={localGroup}
            alreadyJoined={userData.groupIds?.includes(localGroup.id)}
            userData={userData}
            closeModal={handleCloseJoinModal}
         />
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
   );
};

export default CurrentGroup;
