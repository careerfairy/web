import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { IconButton, Modal, useMediaQuery } from "@material-ui/core";
import { InlineWidget } from "react-calendly";
import { useAuth } from "../../../../HOCs/AuthProvider";
import CloseIcon from "@material-ui/icons/Close";

const closeWrapperHeight = 70;
const useStyles = makeStyles((theme) => ({
   contentMobile: {
      padding: "0 !important",
      paddingTop: 0,
   },
   closeWrapper: {
      height: closeWrapperHeight,
      display: "flex",
      justifyContent: "flex-end",
   },
   closeIcon: {
      color: theme.palette.common.white,
      fontSize: "3rem",
      fontWeight: 600,
   },
}));
const Content = ({ handleClose, background, primary, text, mobile }) => {
   const classes = useStyles({ mobile });
   const { userData } = useAuth();

   const props = {
      url: "https://calendly.com/d/n72m-yypp/careerfairy-demo",
      styles: {
         height: `calc(100vh - ${closeWrapperHeight}px)`,
         display: "flex",
      },
      pageSettings: {
         backgroundColor: background.default,
         hideEventTypeDetails: false,
         hideLandingPageDetails: false,
         primaryColor: primary.main,
         textColor: text.primary,
      },

      prefill: {
         email: userData.userEmail || "",
         firstName: userData.firstName || "",
         lastName: userData.lastName || "",
         name: `${userData.firstName || ""} ${userData.lastName || ""}`,
      },
   };
   return (
      <React.Fragment>
         <div className={classes.closeWrapper}>
            <div>
               <IconButton onClick={handleClose}>
                  <CloseIcon className={classes.closeIcon} />
               </IconButton>
            </div>
         </div>
         <InlineWidget {...props} />
      </React.Fragment>
   );
};
const CalendlyModal = ({ open, onClose }) => {
   const theme = useTheme();
   const mobile = useMediaQuery(theme.breakpoints.down("xs"));

   const handleClose = () => {
      onClose();
   };
   return (
      <Modal
         open={open}
         aria-labelledby="simple-modal-title"
         aria-describedby="simple-modal-description"
         onClose={handleClose}
      >
         <Content
            primary={theme.palette.primary}
            mobile={mobile}
            text={theme.palette.text}
            background={theme.palette.background}
            handleClose={handleClose}
         />
      </Modal>
   );
};

export default CalendlyModal;
