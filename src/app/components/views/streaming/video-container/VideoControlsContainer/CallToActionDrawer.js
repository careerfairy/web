import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Divider, Drawer, IconButton } from "@material-ui/core";
import PropTypes from "prop-types";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import CloseIcon from "@material-ui/icons/ChevronLeft";
import clsx from "clsx";
import { QuestionContainerTitle } from "materialUI/GlobalContainers";
import CallToActionForm from "./CallToActionForm";

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
      width: "100%",
      alignItems: "center",
   },
   titleWrapper: {
      flex: 1,
   },
   callToActionContentWrapper: {
      padding: theme.spacing(3),
      flex: 1,
   },
}));

const Content = ({ handleClose, handleSave, handleSend, fullScreen }) => {
   const classes = useStyles();

   return (
      <div
         className={clsx(classes.drawerContent, {
            [classes.fullScreenDrawerContent]: fullScreen,
         })}
      >
         <div className={classes.headerWrapper}>
            {/*<Typography noWrap className={classes.ctaTitle} variant="h4">*/}
            {/*   Send a call to action*/}
            {/*</Typography>*/}
            <QuestionContainerTitle>
               Send a call to action
            </QuestionContainerTitle>
            <IconButton onClick={handleClose}>
               <CloseIcon />
            </IconButton>
         </div>
         <Divider />
         <div className={classes.callToActionContentWrapper}>
            <CallToActionForm handleSave={handleSave} handleSend={handleSend} />
         </div>
      </div>
   );
};

Content.propTypes = {
   handleClose: PropTypes.func,
   fullScreen: PropTypes.bool,
   handleSave: PropTypes.func,
};

const CallToActionDrawer = ({ open, onClose }) => {
   const theme = useTheme();
   const fullScreen = useMediaQuery(theme.breakpoints.down("xs"));

   const handleClose = () => {
      onClose();
   };

   const handleSend = async (values) => {
      console.log("CTA SENT!!! ;)");
      return alert(JSON.stringify(values, null, 2));
   };
   const handleSave = async (values) => {
      console.log("CTA SAVED!!! ;)");
      return alert(JSON.stringify(values, null, 2));
   };

   return (
      <Drawer anchor="left" open={open} onClose={handleClose}>
         <Content
            handleSend={handleSend}
            fullScreen={fullScreen}
            handleClose={handleClose}
            handleSave={handleSave}
         />
      </Drawer>
   );
};

CallToActionDrawer.propTypes = {
   onClose: PropTypes.func.isRequired,
   open: PropTypes.bool,
};

export default CallToActionDrawer;
