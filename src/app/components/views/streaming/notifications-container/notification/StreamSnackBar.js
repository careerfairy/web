import React, { useContext, useEffect } from "react";
import { Button } from "@material-ui/core";
import TutorialContext from "context/tutorials/TutorialContext";
import * as actions from "store/actions";
import { useDispatch } from "react-redux";

const StreamSnackBar = ({ notification, handRaiseMenuOpen }) => {
   const dispatch = useDispatch();
   const { handleConfirmStep, isOpen } = useContext(TutorialContext);
   const enqueueSnackbar = (...args) =>
      dispatch(actions.enqueueSnackbar(...args));
   const closeSnackbar = (...args) => dispatch(actions.closeSnackbar(...args));
   useEffect(() => {
      if (!handRaiseMenuOpen) {
         enqueueSnackbar({
            message: notification.message,
            options: {
               variant: "info",
               action,
               key: notification.id,
               preventDuplicate: true,
            },
         });
      }
      // Dismisses the notification once the component unmounts
      return () => closeSnackbar(notification.id);
   }, []);

   useEffect(() => {
      if (handRaiseMenuOpen) {
         closeSnackbar(notification.id);
      }
   }, [handRaiseMenuOpen]);

   const action = (key) => {
      return (
         <>
            <Button
               style={{ marginRight: "1rem" }}
               color="primary"
               variant="contained"
               size="small"
               onClick={() => {
                  notification.confirm();
                  if (isOpen(10)) {
                     handleConfirmStep(10);
                  }
                  closeSnackbar(key);
               }}
            >
               {notification.confirmMessage}
            </Button>
            <Button
               disabled={isOpen(10)}
               variant="contained"
               size="small"
               onClick={() => {
                  notification.cancel();
                  closeSnackbar(key);
               }}
            >
               {notification.cancelMessage}
            </Button>
         </>
      );
   };

   return <div></div>;
};

export default StreamSnackBar;
