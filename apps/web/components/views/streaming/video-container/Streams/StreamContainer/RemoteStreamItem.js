import React, { useCallback, useContext, useEffect } from "react"
import StreamItem from "./StreamItem"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import TutorialContext from "context/tutorials/TutorialContext"
import {
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "materialUI/GlobalTooltips"

const RemoteStreamItem = ({
   speaker,
   stream,
   big,
   index,
   videoMutedBackgroundImg,
}) => {
   const { getActiveTutorialStepKey, handleConfirmStep } =
      useContext(TutorialContext)
   const activeStep = getActiveTutorialStepKey()
   const isScreenShareVideo = stream.uid.includes?.("screen")

   const {
      playAllRemoteVideos,
      muteAllRemoteVideos,
      unmuteFailedMutedRemoteVideos,
   } = useSelector((state) => state.stream.streaming)

   const dispatch = useDispatch()

   const setAVideoIsMuted = () => dispatch(actions.setVideoIsMuted())

   useEffect(() => {
      if (stream.uid === "demoStream") {
         generateDemoHandRaiser()
      } else {
         !muteAllRemoteVideos && playVideo()
      }
   }, [stream.uid, stream.videoTrack])

   useEffect(() => {
      if (playAllRemoteVideos) {
         playVideo()
      }
   }, [playAllRemoteVideos])

   useEffect(() => {
      if (unmuteFailedMutedRemoteVideos) {
         stream?.audioTrack?.play()
      }
   }, [unmuteFailedMutedRemoteVideos])

   useEffect(() => {
      if (muteAllRemoteVideos) {
         stream?.stream?.audioTrack?.stop()
      } else {
         stream?.stream?.audioTrack?.play()
      }
   }, [muteAllRemoteVideos])

   function playVideo() {
      try {
         if (stream?.videoTrack && !stream?.videoTrack?.isPlaying) {
            stream.videoTrack?.play(`${stream.uid}`, {
               fit: isScreenShareVideo ? "contain" : "cover",
            })
         }
      } catch (e) {
         setAVideoIsMuted()
         console.error("-> error in PLAY VIDEO", e)
      }
   }

   const generateDemoHandRaiser = useCallback(() => {
      let video = document.createElement("video")
      const videoContainer = document.querySelector("#" + stream.uid)
      videoContainer.style.zIndex = 1000
      videoContainer.style.backgroundColor = "black"
      videoContainer.appendChild(video)
      video.src = stream.url
      video.loop = true
      video.play()
   }, [stream.url])

   return (
      <WhiteTooltip
         placement="top"
         title={
            <React.Fragment>
               <TooltipTitle>Hand Raise (3/5)</TooltipTitle>
               <TooltipText>
                  Once connected, the viewer who raised their hand will appear
                  as an additional streamer
               </TooltipText>
               {activeStep === 11 && (
                  <TooltipButtonComponent
                     onConfirm={() => {
                        handleConfirmStep(11)
                     }}
                     buttonText="Ok"
                  />
               )}
            </React.Fragment>
         }
         open={activeStep === 11 && stream.uid === "demoStream"}
         style={{
            width: "100%",
            display: "flex",
         }}
      >
         <StreamItem
            speaker={speaker}
            stream={stream}
            videoMuted={!stream.videoTrack || stream.videoMuted}
            audioMuted={
               stream.audioMuted === undefined ? true : stream.audioMuted
            }
            index={index}
            big={big}
            videoMutedBackgroundImg={videoMutedBackgroundImg}
         />
      </WhiteTooltip>
   )
}

export default RemoteStreamItem
