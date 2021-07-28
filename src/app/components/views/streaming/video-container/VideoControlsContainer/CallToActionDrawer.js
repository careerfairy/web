import React, { memo, useMemo, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Box, Button, Divider, Drawer, IconButton, Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import CloseIcon from "@material-ui/icons/ChevronLeft";
import clsx from "clsx";
import { QuestionContainerTitle } from "materialUI/GlobalContainers";
import CallToActionForm from "./CallToActionForm";
import { useFirestore, useFirestoreConnect } from "react-redux-firebase";
import useStreamQuery from "../../../../custom-hook/useQuery";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import CallToActionFormModal from "./CallToActionFormModal";

const useStyles = makeStyles((theme) => ({
   drawerContent: {
      width: 350,
      flex: 1,
      display: "flex",
      flexDirection: "column",
   },
   fullScreenDrawerContent: {
      width: "100vw",
   },
   ctaTitle: {
      fontSize: "1.5rem",
      fontWeight: 500,
      flex: 1,
   },
   headerWrapper: {
      padding: theme.spacing(3),
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
   },
   headerTitleWrapper:{
      display: "flex",
      width: "100%",

   },
   titleWrapper: {
      flex: 1,
   },
   callToActionContentWrapper: {
      padding: theme.spacing(3),
      flex: 1,
   },
}));

const callToActionSelector = createSelector(
   (state) => state.firestore.ordered["callToActions"],
   (callToActions) => (callToActions?.length ? callToActions : null)
);
const Content = ({ handleClose, handleSave, handleSend, fullScreen }) => {
   const classes = useStyles();
   const [callToActionModalOpen, setCallToActionModalOpen] = useState(false);
   const callToActions = useSelector((state) => callToActionSelector(state));
   console.log("-> callToActions", callToActions);
   const query = useStreamQuery({
      storeAs: "callToActions",
      subcollections: [
         {
            collection: "callToActions",
         },
      ],
   });

   const handleCloseCallToActionFormDialog = () => {
      setCallToActionModalOpen(false);
   };
   const handleOpenCallToActionFormDialog = () => {
      setCallToActionModalOpen(true);
   };
   console.log("-> query", query);

   console.log("-> Content");

   useFirestoreConnect(query);

   return (
      <React.Fragment>
         <div
            className={clsx(classes.drawerContent, {
               [classes.fullScreenDrawerContent]: fullScreen,
            })}
         >
            <div className={classes.headerWrapper}>
            <div className={classes.headerTitleWrapper}>
               <Typography noWrap className={classes.ctaTitle} variant="h4">
                  Send a call to action
               </Typography>
               {/*<QuestionContainerTitle>*/}
               {/*   Send a call to action*/}
               {/*</QuestionContainerTitle>*/}
               <IconButton onClick={handleClose}>
                  <CloseIcon />
               </IconButton>
            </div>
            <Box display="flex" >
               <Button onClick={handleOpenCallToActionFormDialog} variant="contained" color="primary">
                  Create call to action
               </Button>
            </Box>
            </div>
            <Divider />
            <div className={classes.callToActionContentWrapper}>
            </div>
         </div>
         <CallToActionFormModal
            open={callToActionModalOpen}
            onClose={handleCloseCallToActionFormDialog}
         />
      </React.Fragment>
   );
};

Content.propTypes = {
   handleClose: PropTypes.func,
   fullScreen: PropTypes.bool,
};

const CallToActionDrawer = ({ open, onClose }) => {
   console.log("-> CallToActionDrawer");
   const theme = useTheme();
   const fullScreen = useMediaQuery(theme.breakpoints.down("xs"));

   const handleClose = () => {
      onClose();
   };

   return (
      <Drawer anchor="left" open={open} onClose={handleClose}>
         <Content fullScreen={fullScreen} handleClose={handleClose} />
      </Drawer>
   );
};

CallToActionDrawer.propTypes = {
   onClose: PropTypes.func.isRequired,
   open: PropTypes.bool,
};

export default memo(CallToActionDrawer);
