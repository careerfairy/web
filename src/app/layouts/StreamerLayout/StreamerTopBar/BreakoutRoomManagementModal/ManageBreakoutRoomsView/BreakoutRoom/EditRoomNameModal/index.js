import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { GlassDialog } from "materialUI/GlobalModals";
import {
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
   Slide,
   TextField,
} from "@material-ui/core";
import { useRouter } from "next/router";
import { useFirebaseService } from "context/firebase/FirebaseServiceContext";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import { useFormik } from "formik";

const minTitleLength = 5;

const ModalContent = ({ handleClose, roomTitle, roomId }) => {
   const {
      query: { livestreamId },
   } = useRouter();
   const { updateBreakoutRoom } = useFirebaseService();
   const dispatch = useDispatch();
   const {
      handleChange,
      values,
      touched,
      handleSubmit,
      errors,
      dirty,
      isSubmitting,
   } = useFormik({
      initialValues: {
         newTitle: roomTitle,
      },
      enableReinitialize: true,
      onSubmit: async (values) => {
         try {
            const newData = {
               title: values.newTitle,
            };
            await updateBreakoutRoom(newData, roomId, livestreamId);
            handleClose();
         } catch (e) {
            dispatch(actions.sendGeneralError(e));
         }
      },
      validate: (values) => {
         let errors = {};
         if (!values.newTitle) {
            errors.newTitle = "Please enter a new title";
         }
         if (values.newTitle.length < minTitleLength) {
            errors.newTitle = ` Must be at least ${minTitleLength} characters`;
         }
         if (values.newTitle === roomTitle) {
            errors.newTitle = `The title must be different`;
         }
         return errors;
      },
   });

   return (
      <form onSubmit={handleSubmit}>
         <DialogTitle>Edit Room Name</DialogTitle>
         <DialogContent>
            <TextField
               error={Boolean(touched.newTitle && errors.newTitle)}
               id="newTitle"
               helperText={touched.newTitle && errors.newTitle}
               type="text"
               autoFocus
               name="newTitle"
               defaultValue={values.newTitle}
               onChange={handleChange}
               InputProps={{
                  required: true,
               }}
            />
         </DialogContent>
         <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            <Button
               type="submit"
               disabled={!dirty || isSubmitting}
               variant="contained"
               color="primary"
               onClick={handleSubmit}
            >
               Rename
            </Button>
         </DialogActions>
      </form>
   );
};

const EditRoomNameModal = ({ open, onClose, roomTitle, roomId }) => {
   const handleClose = () => {
      onClose();
   };
   return (
      <GlassDialog
         TransitionComponent={Slide}
         onClose={handleClose}
         open={open}
      >
         <ModalContent
            handleClose={handleClose}
            roomId={roomId}
            roomTitle={roomTitle}
         />
      </GlassDialog>
   );
};

export default EditRoomNameModal;
