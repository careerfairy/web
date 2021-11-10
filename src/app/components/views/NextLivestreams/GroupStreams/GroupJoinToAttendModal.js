import React, { Fragment, useEffect, useState } from "react";
import { useFirebase, withFirebase } from "context/firebase";
import UserCategorySelector from "components/views/profile/UserCategorySelector";
import {
   Box,
   Button,
   CardMedia,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import LogoButtons from "./LogoButtons";
import StatsUtil from "../../../../data/util/StatsUtil";

const useStyles = makeStyles((theme) => ({
   media: {
      display: "flex",
      justifyContent: "center",
      padding: "1.5em 1em 1em 1em",
      height: "120px",
   },
   image: {
      objectFit: "contain",
      maxWidth: "80%",
      padding: theme.spacing(1),
      borderRadius: theme.spacing(1),
      background: theme.palette.common.white,
   },
   actions: {
      display: "flex",
      flexFlow: "column",
      alignItems: "center",
   },
}));

const GroupJoinToAttendModal = ({
   groups,
   open,
   closeModal,
   groupsWithPolicies,
   userData,
   onConfirm,
   alreadyJoined,
   isOnStreamPage,
   followAGroupTitle,
   updateCategoriesTitle,
   onJoinAttempt, // callback will be called regardless if the joining the group succeeded or failed
}) => {
   const classes = useStyles();
   const firebase = useFirebase();
   const [categories, setCategories] = useState([]);
   const [group, setGroup] = useState({});
   const [allSelected, setAllSelected] = useState(false);
   const [submitting, setSubmitting] = useState(false);
   const [localGroupsWithPolicies, setLocalGroupsWithPolicies] = useState([]);
   useEffect(() => {
      setLocalGroupsWithPolicies(groupsWithPolicies);
   }, [groupsWithPolicies]);

   useEffect(() => {
      if (groups && groups.length && groups.length === 1) {
         setGroup(groups[0]);
      } else {
         setGroup({});
      }
   }, [groups]);

   useEffect(() => {
      if (group.categories) {
         const groupCategories = group.categories.map((obj) => ({
            ...obj,
            selectedValueId: "",
         }));
         if (userData && alreadyJoined) {
            const userCategories = userData.registeredGroups?.find(
               (el) => el.groupId === group.id
            )?.categories;
            userCategories?.forEach((category, index) => {
               groupCategories?.forEach((groupCategory) => {
                  const exists = groupCategory.options.some(
                     (option) => option.id === category.selectedValueId
                  );
                  if (exists) {
                     groupCategory.selectedValueId = category.selectedValueId;
                  }
               });
            });
         }
         setCategories(groupCategories);
      }
   }, [group]);

   useEffect(() => {
      if (categories && open) {
         const notAllSelected = !categories.some(
            (category) => category.selectedValueId === ""
         );
         setAllSelected(notAllSelected);
      }
   }, [categories, open]);

   const handleSetSelected = (categoryId, event) => {
      const newCategories = [...categories];
      const index = newCategories.findIndex((el) => el.id === categoryId);
      newCategories[index].selectedValueId = event.target.value;
      setCategories(newCategories);
   };

   const handleJoinGroup = async () => {
      try {
         setSubmitting(true);
         const newCategories = categories.map((categoryObj) => {
            return {
               id: categoryObj.id,
               selectedValueId: categoryObj.selectedValueId,
            };
         });
         const groupObj = {
            groupId: group.id,
            categories: newCategories,
         };
         let arrayOfGroupObjects = userData.registeredGroups?.length
            ? userData.registeredGroups?.filter(
                 (group) => group.groupId !== groupObj.groupId
              )
            : [];

         arrayOfGroupObjects.push(groupObj);

         let arrayOfGroupIds = arrayOfGroupObjects.map((obj) => obj.groupId);

         if (userData.groupIds?.length) {
            arrayOfGroupIds = [...arrayOfGroupIds, ...userData.groupIds];
         }

         const userId = userData.id || userData.userEmail;
         await firebase.setgroups(
            userId,
            [...new Set(arrayOfGroupIds)],
            arrayOfGroupObjects
         );
         setSubmitting(false);
         if (onConfirm) {
            onConfirm();
         }
         handleClose();
      } catch (e) {
         console.log("error in handle join", e);
         setSubmitting(false);
      }
      onJoinAttempt?.();
   };

   const renderCategories = categories.map((category, index) => {
      return (
         <Fragment key={category.id}>
            <UserCategorySelector
               handleSetSelected={handleSetSelected}
               index={index}
               isNew={
                  alreadyJoined &&
                  !StatsUtil.studentHasSelectedCategory(
                     userData,
                     group,
                     category.id
                  )
               }
               alreadyJoined={alreadyJoined}
               category={category}
            />
         </Fragment>
      );
   });

   const handleClose = () => {
      closeModal?.();
   };

   return (
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
         {!group.universityName ? (
            <>
               <DialogTitle align="center">
                  {followAGroupTitle ||
                     "Please follow one of the following groups in order to register:"}
               </DialogTitle>
               <LogoButtons setGroup={setGroup} groups={groups} />
            </>
         ) : (
            <>
               <DialogTitle align="center">
                  {updateCategoriesTitle || "Join live streams from"}
               </DialogTitle>
               <CardMedia className={classes.media}>
                  <img src={group.logoUrl} className={classes.image} alt="" />
               </CardMedia>
               <DialogContent>
                  <DialogContentText align="center" noWrap>
                     {group.description}
                  </DialogContentText>
                  <Box p={2} className={classes.actions}>
                     {!!categories.length && renderCategories}
                  </Box>
                  <Box p={2} className={classes.actions}>
                     {localGroupsWithPolicies.map((group, index) => (
                        <Typography style={{ fontSize: "0.8rem" }}>
                           Your participant information (surname, first name,
                           university affiliation) and the data above will be
                           transferred to the organizer when you register for
                           the event. The data protection notice of the
                           organizer applies. You can find it
                           <a
                              target="_blank"
                              style={{ marginLeft: 4 }}
                              href={group.privacyPolicyUrl}
                           >
                              here
                           </a>
                           .
                        </Typography>
                     ))}
                  </Box>
               </DialogContent>
               <DialogActions>
                  {!isOnStreamPage && (
                     <Button size="large" onClick={handleClose}>
                        Cancel
                     </Button>
                  )}
                  {((alreadyJoined && group.categories) || !alreadyJoined) && (
                     <Button
                        disabled={!allSelected || submitting}
                        variant="contained"
                        size="large"
                        endIcon={
                           submitting && (
                              <CircularProgress size={20} color="inherit" />
                           )
                        }
                        onClick={handleJoinGroup}
                        color="primary"
                        autoFocus
                     >
                        {isOnStreamPage ? "Enter event" : "I'll attend"}
                     </Button>
                  )}
               </DialogActions>
            </>
         )}
      </Dialog>
   );
};

export default withFirebase(GroupJoinToAttendModal);
