import LoadingButton from "@mui/lab/LoadingButton"
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
import {
   VIMEO_URL_REGEX,
   YOUTUBE_URL_REGEX,
} from "../../../../components/util/constants"
import { useFirebaseService } from "../../../../context/firebase/FirebaseServiceContext"
import { useCurrentStream } from "../../../../context/stream/StreamContext"
import useStreamRef from "../../../custom-hook/useStreamRef"

interface Props {
   open: boolean
   onClose: () => void
}

const schema = yup.object().shape({
   youtubeUrl: yup
      .string()
      .test(
         "is-valid-video-url",
         "Must be a valid YouTube or Vimeo video URL",
         (value) => YOUTUBE_URL_REGEX.test(value) || VIMEO_URL_REGEX.test(value)
      )
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
            // Ensure the URL is properly formatted
            const url = new URL(
               values.youtubeUrl.startsWith("http")
                  ? values.youtubeUrl
                  : `https://${values.youtubeUrl}`
            )
            await setCurrentVideo(streamRef, url.href, streamerId)
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
                  formik.touched.youtubeUrl
                     ? Boolean(formik.errors.youtubeUrl)
                     : null
               }
               helperText={
                  formik.touched.youtubeUrl ? formik.errors.youtubeUrl : null
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
