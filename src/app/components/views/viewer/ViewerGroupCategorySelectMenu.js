import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import PropTypes from "prop-types";
import { useAuth } from "../../../HOCs/AuthProvider";
import GroupJoinToAttendModal from "../NextLivestreams/GroupStreams/GroupJoinToAttendModal";

const useStyles = makeStyles((theme) => ({
   root: {
      height: "100vh",
      width: "100vw",
      background: theme.palette.primary.main,
   },
   container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
   },
   contentWrapper: {
      display: "flex",
      flexDirection: "column",
   },
}));

const ViewerGroupCategorySelectMenu = ({
   onClose,
   groupsToFollow,
   groupToUpdateCategories,
   groupsWithPolicies,
}) => {
   const { userData } = useAuth();
   const classes = useStyles();

   const handleClose = () => {
      onClose();
   };

   return (
      <Box className={classes.root}>
         <GroupJoinToAttendModal
            open={Boolean(groupsToFollow.length || groupToUpdateCategories)}
            isOnStreamPage
            groups={
               groupsToFollow.length
                  ? groupsToFollow
                  : [groupToUpdateCategories]
            }
            followAGroupTitle={"Where are you joining from?"}
            updateCategoriesTitle={`${
               groupToUpdateCategories?.universityName ||
               groupsToFollow[0]?.universityName
            } Would Like To Know More About You`}
            groupsWithPolicies={groupsWithPolicies}
            alreadyJoined={Boolean(groupToUpdateCategories)}
            userData={userData}
            onJoinAttempt={handleClose}
         />
      </Box>
   );
};

ViewerGroupCategorySelectMenu.propTypes = {
   onClose: PropTypes.func.isRequired,
};

export default ViewerGroupCategorySelectMenu;
