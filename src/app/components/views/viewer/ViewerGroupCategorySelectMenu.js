import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import PropTypes from "prop-types";
import RegistrationModal from "../common/registration-modal";

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

const ViewerGroupCategorySelectMenu = ({ joinGroupModalData, onGroupJoin }) => {
   const classes = useStyles();

   return (
      <Box className={classes.root}>
         <RegistrationModal
            open={Boolean(joinGroupModalData)}
            onGroupJoin={onGroupJoin}
            livestream={joinGroupModalData?.livestream}
            groups={joinGroupModalData?.groups}
         />
      </Box>
   );
};

ViewerGroupCategorySelectMenu.propTypes = {
   onGroupJoin: PropTypes.func.isRequired,
   joinGroupModalData: PropTypes.shape({
      groups: PropTypes.array,
   }),
};

export default ViewerGroupCategorySelectMenu;
