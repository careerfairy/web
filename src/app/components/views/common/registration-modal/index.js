import PropTypes from "prop-types";
import React from "react";
import { Dialog } from "@material-ui/core";
import { RegistrationContextProvider } from "context/registration/RegistrationContext";
import RegistrationForm from "./RegistrationForm";

const RegistrationModal = ({
   open,
   handleClose,
   livestream,
   groups,
   promptOtherEventsOnFinal,
}) => {
   const onClose = () => {
      handleClose();
   };

   return (
      <Dialog
         maxWidth="md"
         scroll="paper"
         fullWidth
         open={open}
         onClose={onClose}
      >
         <RegistrationContextProvider
            closeModal={onClose}
            livestream={livestream}
            groups={groups}
            promptOtherEventsOnFinal={promptOtherEventsOnFinal}
         >
            <RegistrationForm />
         </RegistrationContextProvider>
      </Dialog>
   );
};

RegistrationModal.propTypes = {
   handleClose: PropTypes.func.isRequired,
   open: PropTypes.bool.isRequired,
};

export default RegistrationModal;
