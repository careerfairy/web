import React from "react";
import { GlassDialog } from "materialUI/GlobalModals";
import {
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
   Slide,
   TextField,
} from "@mui/material";
import { useRouter } from "next/router";
import { useFirebase } from "context/firebase";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as actions from "store/actions";
import { useCurrentStream } from "context/stream/StreamContext";

const minAnnouncementLength = 5;

const ModalContent = ({ handleClose }) => {
   const {
      query: { livestreamId },
   } = useRouter();
   const { sendBroadcastToBreakoutRooms, getStreamerData } = useFirebase();
   const { currentLivestream, streamerId } = useCurrentStream();
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
         announcement: "",
      },
      enableReinitialize: true,
      onSubmit: async (values) => {
         try {
            const announcement = values.announcement;
            const streamerData = getStreamerData(currentLivestream, streamerId);
            const authorData = {
               name: `${streamerData.firstName} ${streamerData.lastName}`,
               email: "Streamer",
            };
            await sendBroadcastToBreakoutRooms(
               announcement,
               livestreamId,
               authorData
            );
            handleClose();
         } catch (e) {
            dispatch(actions.sendGeneralError(e));
         }
      },
      validate: (values) => {
         let errors = {};
         if (!values.announcement) {
            errors.announcement = "Please enter an announcement";
         }
         if (values.announcement.length < minAnnouncementLength) {
            errors.announcement = ` Must be at least ${minAnnouncementLength} characters`;
         }
         return errors;
      },
   });

   return (
      <form onSubmit={handleSubmit}>
         <DialogTitle>Send a message to all rooms</DialogTitle>
         <DialogContent>
            <TextField
               error={Boolean(touched.announcement && errors.announcement)}
               id="announcement"
               helperText={touched.announcement && errors.announcement}
               type="text"
               autoFocus
               name="announcement"
               defaultValue={values.announcement}
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
               Send
            </Button>
         </DialogActions>
      </form>
   );
};

const AnnouncementModal = ({ open, onClose }) => {
   const handleClose = () => {
      onClose();
   };

   return (
      <GlassDialog
         TransitionComponent={Slide}
         onClose={handleClose}
         open={open}
      >
         <ModalContent handleClose={handleClose} />
      </GlassDialog>
   );
};

export default AnnouncementModal;
