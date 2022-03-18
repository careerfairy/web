import React from "react"
import { GlassDialog } from "materialUI/GlobalModals"
import {
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
   Slide,
   TextField,
} from "@mui/material"
import { useRouter } from "next/router"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useDispatch } from "react-redux"
import { useFormik } from "formik"
import * as actions from "store/actions"

const minTitleLength = 5

const ModalContent = ({ handleClose }) => {
   const {
      query: { livestreamId },
   } = useRouter()
   const { addBreakoutRoom } = useFirebaseService()
   const dispatch = useDispatch()
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
         title: "",
      },
      enableReinitialize: true,
      onSubmit: async (values) => {
         try {
            const title = values.title
            await addBreakoutRoom(title, livestreamId)
            handleClose()
         } catch (e) {
            dispatch(actions.sendGeneralError(e))
         }
      },
      validate: (values) => {
         let errors = {}
         if (!values.title) {
            errors.title = "Please enter a title"
         }
         if (values.title.length < minTitleLength) {
            errors.title = ` Must be at least ${minTitleLength} characters`
         }
         return errors
      },
   })

   return (
      <form onSubmit={handleSubmit}>
         <DialogTitle>Create a new Room</DialogTitle>
         <DialogContent>
            <TextField
               error={Boolean(touched.title && errors.title)}
               label="Room Title"
               id="title"
               helperText={touched.title && errors.title}
               type="text"
               autoFocus
               name="title"
               defaultValue={values.title}
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
               Add Room
            </Button>
         </DialogActions>
      </form>
   )
}

const AddRoomModal = ({ open, onClose }) => {
   const handleClose = () => {
      onClose()
   }

   return (
      <GlassDialog
         TransitionComponent={Slide}
         onClose={handleClose}
         open={open}
      >
         <ModalContent handleClose={handleClose} />
      </GlassDialog>
   )
}

export default AddRoomModal
