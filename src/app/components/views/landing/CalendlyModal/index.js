import React from "react";
import { useTheme } from "@mui/material/styles";
import { Box, IconButton, Modal, useMediaQuery } from "@mui/material";
import { InlineWidget } from "react-calendly";
import { useAuth } from "../../../../HOCs/AuthProvider";
import CloseIcon from "@mui/icons-material/Close";

const closeWrapperHeight = 70;
const styles = {
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
      color: theme => theme.palette.common.white,
      fontSize: "3rem",
      fontWeight: 600,
   },
}
const Content = ({ handleClose, background, primary, text }) => {
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
         email: userData?.userEmail || "",
         firstName: userData?.firstName || "",
         lastName: userData?.lastName || "",
         name: `${userData?.firstName || ""} ${userData?.lastName || ""}`,
      },
   };
   return (
      <React.Fragment>
         <Box sx={styles.closeWrapper}>
            <div>
               <IconButton onClick={handleClose} size="large">
                  <CloseIcon sx={styles.closeIcon} />
               </IconButton>
            </div>
         </Box>
         <InlineWidget {...props} />
      </React.Fragment>
   );
};
const CalendlyModal = ({ open, onClose }) => {
   const theme = useTheme();
   const mobile = useMediaQuery(theme.breakpoints.down('sm'));

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
         <div>
            <Content
               primary={theme.palette.primary}
               mobile={mobile}
               text={theme.palette.text}
               background={theme.palette.background}
               handleClose={handleClose}
            />
         </div>
      </Modal>
   );
};

export default CalendlyModal;
