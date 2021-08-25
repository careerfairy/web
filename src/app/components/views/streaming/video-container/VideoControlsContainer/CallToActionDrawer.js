import React, { memo, useEffect, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
   Box,
   Button,
   Divider,
   Drawer,
   IconButton,
   Typography,
} from "@material-ui/core";
import PropTypes from "prop-types";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import CloseIcon from "@material-ui/icons/ChevronLeft";
import clsx from "clsx";
import CallToActionFormModal from "./CallToActionFormModal";
import CallToActionList from "./CallToActionList";
import { useFirebase } from "../../../../../context/firebase";
import useStreamRef from "../../../../custom-hook/useStreamRef";

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
   headerTitleWrapper: {
      display: "flex",
      width: "100%",
   },
   titleWrapper: {
      flex: 1,
   },
   callToActionContentWrapper: {
      // padding: theme.spacing(3),
      flex: 1,
      display: "flex",
   },
}));

const Content = ({ handleClose, handleSave, handleSend, fullScreen }) => {
   const classes = useStyles();
   const streamRef = useStreamRef();
   const { deleteCallToAction, resendCallToAction } = useFirebase();
   const [callToActionModalOpen, setCallToActionModalOpen] = useState(false);
   const [callToActionToEdit, setCallToActionToEdit] = useState(null);

   useEffect(()=> {
      if(callToActionToEdit){
         setCallToActionModalOpen(true)
      }
   },[callToActionToEdit])

   const handleCloseCallToActionFormDialog = () => {
      setCallToActionToEdit(null)
      setCallToActionModalOpen(false);
   };
   const handleOpenCallToActionFormDialog = () => {
      setCallToActionModalOpen(true);
   };

   const handleClickDeleteCallToAction = async (callToActionId) => {
      try {
         await deleteCallToAction(streamRef, callToActionId);
      } catch (e) {
         console.error("error deleting callToAction", e);
      }
      setCallToActionToEdit(null)
   };
   const handleClickEditCallToAction = (newCallToActionToEditData) => {
      setCallToActionToEdit(newCallToActionToEditData);
   };

   const handleClickResendCallToAction = async (callToActionId) => {
      try {
         await resendCallToAction(streamRef, callToActionId)
      } catch (e) {
         console.error("error resending callToAction", e);
      }
   }

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
                  <IconButton onClick={handleClose}>
                     <CloseIcon />
                  </IconButton>
               </div>
               <Box display="flex">
                  <Button
                     onClick={handleOpenCallToActionFormDialog}
                     variant="contained"
                     color="primary"
                  >
                     Create call to action
                  </Button>
               </Box>
            </div>
            <Divider />
            <div className={classes.callToActionContentWrapper}>
               <CallToActionList
                  handleClickDeleteCallToAction={handleClickDeleteCallToAction}
                  handleClickEditCallToAction={handleClickEditCallToAction}
                  handleClickResendCallToAction={handleClickResendCallToAction}
               />
            </div>
         </div>
         <CallToActionFormModal
            open={callToActionModalOpen}
            onClose={handleCloseCallToActionFormDialog}
            callToActionToEdit={callToActionToEdit}
         />
      </React.Fragment>
   );
};

Content.propTypes = {
   handleClose: PropTypes.func,
   fullScreen: PropTypes.bool,
};

const CallToActionDrawer = ({ open, onClose }) => {
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
