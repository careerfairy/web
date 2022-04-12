import { Fragment, useEffect, useRef, useState } from "react"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import ReactPlayer from "react-player/youtube"
import { useFormik } from "formik"

import {
   Button,
   Dialog,
   DialogContent,
   TextField,
   Typography,
} from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "../../store/actions"
import useStreamRef from "../custom-hook/useStreamRef"
import * as yup from "yup"
import { YOUTUBE_URL_REGEX } from "../../components/util/constants"

const schema = yup.object().shape({
   youtubeUrl: yup
      .string()
      .matches(YOUTUBE_URL_REGEX, { message: "Must be a valid url" })
      .required("Must be a valid url"),
})

const SynchronisedVideoViewer = ({
   livestreamId,
   presenter,
   streamerId,
   viewer,
}) => {
   const { unpauseFailedPlayRemoteVideos } = useSelector(
      // @ts-ignore
      (state) => state.stream.streaming
   )
   const streamRef = useStreamRef()
   const reactPlayerRef = useRef(null)
   const { listenToCurrentVideo, updateCurrentVideo, updateCurrentVideoState } =
      useFirebaseService()
   const [loading, setLoading] = useState(false)
   const [muted, setMuted] = useState(viewer)
   const [openModal, setOpenModal] = useState(false)
   const [initialized, setInitialized] = useState(false)
   const [currentVideo, setCurrentVideo] = useState(null)

   const dispatch = useDispatch()

   const formik = useFormik({
      initialValues: {
         youtubeUrl: "",
      },
      validationSchema: schema,
      onSubmit: async (values) => {
         try {
            await updateCurrentVideo(streamRef, values.youtubeUrl)
            setOpenModal(false)
         } catch (e) {
            console.log("-> error in setting video", e)
         }
      },
   })
   const setAVideoIsMuted = () => dispatch(actions.setVideoIsPaused())

   const getTimeBetweenDates = (startDate, endDate) => {
      return (endDate.getTime() - startDate.getTime()) / 1000
   }

   const handleSeek = (seconds: number) => {
      return reactPlayerRef.current.seekTo(seconds, "seconds")
   }

   useEffect(() => {
      if (viewer) {
         setAVideoIsMuted()
      }
   }, [])

   useEffect(() => {
      if (unpauseFailedPlayRemoteVideos) {
         setMuted(false)
      }
   }, [unpauseFailedPlayRemoteVideos])

   useEffect(() => {
      if (!currentVideo || !reactPlayerRef.current) return
      if (
         !initialized &&
         currentVideo.state === "playing" &&
         currentVideo.lastPlayed
      ) {
         handleInitialize()
      }
      if (initialized && streamerId !== currentVideo.updater) {
         handleSeek(currentVideo.second)
      }
   }, [currentVideo, reactPlayerRef.current, streamerId])

   const handleInitialize = () => {
      const secondsDiff = getTimeBetweenDates(
         currentVideo.lastPlayed.toDate(),
         new Date()
      )
      handleSeek(currentVideo.second + secondsDiff)
      setInitialized(true)
   }

   useEffect(() => {
      if (livestreamId) {
         setLoading(true)
         const unsubscribe = listenToCurrentVideo(
            streamRef,
            (querySnapshot) => {
               if (querySnapshot.exists) {
                  setCurrentVideo(querySnapshot.data())
               }
               setLoading(false)
            }
         )
         return () => unsubscribe()
      }
   }, [livestreamId])

   const updateYoutubeVideoState = (state) => {
      return updateCurrentVideoState(streamRef, state)
   }

   const handlePlay = async () => {
      if (!presenter) {
         return
      }
      return updateYoutubeVideoState({
         state: "playing",
         second: reactPlayerRef.current?.getCurrentTime() || 0,
         updater: streamerId,
      })
   }

   const handlePause = () => {
      if (!presenter) {
         return
      }
      updateYoutubeVideoState({ state: "paused" })
   }

   return (
      <Fragment>
         <div
            style={{
               width: "100%",
               backgroundColor: "black",
               position: "relative",
               height: "calc(100% - 48px)",
            }}
         >
            <div
               style={{
                  position: "absolute",
                  top: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: "9000",
               }}
            >
               {!viewer && (
                  <Button
                     color="primary"
                     variant="contained"
                     onClick={() => setOpenModal(!openModal)}
                  >
                     Share New Video
                  </Button>
               )}
            </div>
            <ReactPlayer
               playing={currentVideo?.state === "playing"}
               ref={reactPlayerRef}
               style={{
                  position: "absolute",
                  top: "50%",
                  left: "0",
                  transform: "translateY(-50%)",
                  pointerEvents: presenter ? "all" : "none",
               }}
               muted={muted}
               controls={presenter}
               url={currentVideo?.url}
               onError={(error) => {
                  console.error(error)
               }}
               width="100%"
               height={"100%"}
               onPlay={handlePlay}
               onPause={handlePause}
            />
         </div>
         <Dialog
            open={openModal}
            maxWidth="sm"
            fullWidth={true}
            onClose={() => setOpenModal(!openModal)}
         >
            <DialogContent style={{ padding: 30 }}>
               <Typography variant="h5">SHARE A NEW YOUTUBE VIDEO</Typography>
               <TextField
                  style={{ margin: "20px 0" }}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  fullWidth
                  id={"youtubeUrl"}
                  type={"url"}
                  name={"youtubeUrl"}
                  value={formik.values.youtubeUrl}
                  variant="outlined"
                  error={
                     formik.touched.youtubeUrl &&
                     Boolean(formik.errors.youtubeUrl)
                  }
                  helperText={
                     formik.touched.youtubeUrl && formik.errors.youtubeUrl
                  }
                  label="Full YouTube video URL"
                  placeholder="https://www.youtube.com/watch?v=cNZNR-wmBxI"
               />
               <Button
                  color="primary"
                  variant="contained"
                  type={"submit"}
                  onClick={() => formik.handleSubmit()}
               >
                  Share Now
               </Button>
            </DialogContent>
         </Dialog>
      </Fragment>
   )
}

export default SynchronisedVideoViewer
