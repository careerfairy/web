import React from "react"
import {
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   TextField,
   Typography,
} from "@mui/material"
import { useFormik } from "formik"
import * as yup from "yup"
import { useFirebaseService } from "../../../../context/firebase/FirebaseServiceContext"
import useStreamRef from "../../../custom-hook/useStreamRef"
import { YOUTUBE_URL_REGEX } from "../../../../components/util/constants"
import { useCurrentStream } from "../../../../context/stream/StreamContext"
import LoadingButton from "@mui/lab/LoadingButton"

interface Props {
   open: boolean
   onClose: () => void
}

const schema = yup.object().shape({
   youtubeUrl: yup
      .string()
      .matches(YOUTUBE_URL_REGEX, { message: "Must be a valid url" })
      .required("Must be a valid url"),
})

const ShareYoutubeVideoModal = ({ open, onClose }: Props) => {
   const streamRef = useStreamRef()
   const { setCurrentVideo, setLivestreamMode } = useFirebaseService()
   const { streamerId } = useCurrentStream()
   const formik = useFormik({
      initialValues: {
         youtubeUrl: "",
      },
      validationSchema: schema,
      onSubmit: async (values) => {
         try {
            await setCurrentVideo(streamRef, values.youtubeUrl, streamerId)
            await setLivestreamMode(streamRef, "video")
         } catch (e) {
            console.log("-> error in setting video", e)
         }
         handleClose()
      },
   })

   const handleClose = () => {
      onClose()
   }

   return (
      <Dialog open={open} maxWidth="sm" fullWidth onClose={onClose}>
         <DialogTitle>
            <Typography variant="h5">Share a new youtube video</Typography>
         </DialogTitle>
         <DialogContent>
            <TextField
               onChange={formik.handleChange}
               onBlur={formik.handleBlur}
               fullWidth
               sx={{ mb: 1 }}
               id={"youtubeUrl"}
               type={"url"}
               name={"youtubeUrl"}
               value={formik.values.youtubeUrl}
               variant="outlined"
               error={
                  formik.touched.youtubeUrl && Boolean(formik.errors.youtubeUrl)
               }
               helperText={
                  formik.touched.youtubeUrl && formik.errors.youtubeUrl
               }
               label="Full YouTube video URL"
               placeholder="https://www.youtube.com/watch?v=cNZNR-wmBxI"
            />
            <Typography color="text.secondary" variant={"subtitle1"}>
               When sharing a video, the player actions (play, pause, etc) will
               be replayed on the viewer&apos;s screens as well.
            </Typography>
            <DialogActions sx={{ pr: 0 }}>
               <LoadingButton
                  color="primary"
                  variant="contained"
                  loading={formik.isSubmitting}
                  type={"submit"}
                  onClick={() => formik.handleSubmit()}
               >
                  Share Now
               </LoadingButton>
            </DialogActions>
         </DialogContent>
      </Dialog>
   )
}

export default ShareYoutubeVideoModal
