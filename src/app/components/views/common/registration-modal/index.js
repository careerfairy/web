import PropTypes from "prop-types";
import React, { memo } from "react";
import { Dialog, Grow } from "@mui/material";
import { RegistrationContextProvider } from "context/registration/RegistrationContext";
import RegistrationForm from "./RegistrationForm";

const RegistrationModal = memo(
   ({
      open,
      handleClose,
      livestream,
      groups,
      promptOtherEventsOnFinal,
      onGroupJoin,
      onFinish,
      targetGroupId,
   }) => {
      const cancelable = Boolean(handleClose);
      const onClose = () => {
         handleClose?.();
      };

      return (
         <Dialog
            maxWidth="md"
            scroll="paper"
            fullWidth
            TransitionComponent={Grow}
            open={open}
            onClose={cancelable ? onClose : undefined}
         >
            <RegistrationContextProvider
               closeModal={onClose}
               livestream={livestream}
               onFinish={onFinish}
               onGroupJoin={onGroupJoin}
               targetGroupId={targetGroupId}
               cancelable={cancelable}
               groups={groups}
               promptOtherEventsOnFinal={promptOtherEventsOnFinal}
            >
               <RegistrationForm />
            </RegistrationContextProvider>
         </Dialog>
      );
   }
);

RegistrationModal.propTypes = {
   open: PropTypes.bool.isRequired,
   onGroupJoin: PropTypes.func,
   handleClose: PropTypes.func,
   onFinish: PropTypes.func,
};

export default RegistrationModal;
