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
      muteAllRemoteVideos,
      unmuteFailedMutedRemoteVideos,
      unpauseFailedPlayRemoteVideos,
   } = useSelector((state) => state.stream.streaming)

   const dispatch = useDispatch()

   const setAVideoIsMuted = useCallback(
      () => dispatch(actions.setVideoIsMuted()),
      [dispatch]
   )

   const playVideo = useCallback(() => {
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
   }, [isScreenShareVideo, setAVideoIsMuted, stream])

   useEffect(() => {
      if (stream.uid === "demoStream") {
         generateDemoHandRaiser(stream)
      } else {
         !muteAllRemoteVideos && playVideo()
      }
   }, [stream.uid, stream.videoTrack, playVideo, muteAllRemoteVideos, stream])

   useEffect(() => {
      if (unpauseFailedPlayRemoteVideos) {
         playVideo()
      }
   }, [unpauseFailedPlayRemoteVideos, playVideo])

   useEffect(() => {
      if (unmuteFailedMutedRemoteVideos) {
         stream?.audioTrack?.play()
      }
   }, [stream?.audioTrack, unmuteFailedMutedRemoteVideos])

   useEffect(() => {
      if (muteAllRemoteVideos) {
         stream?.stream?.audioTrack?.stop()
      } else {
         stream?.stream?.audioTrack?.play()
      }
   }, [muteAllRemoteVideos, stream?.stream?.audioTrack])

   const remoteStreamMuted = !!(stream.audioMuted || !stream.audioTrack)

   const remoteStreamItem = (
      <StreamItem
         speaker={speaker}
         stream={stream}
         videoMuted={!stream.videoTrack || stream.videoMuted}
         audioMuted={remoteStreamMuted}
         index={index}
         big={big}
         videoMutedBackgroundImg={videoMutedBackgroundImg}
      />
   )

   // only render the Tooltip if really needed
   if (activeStep === 11 && stream.uid === "demoStream") {
      return (
         <WhiteTooltip
            placement="top"
            title={
               <React.Fragment>
                  <TooltipTitle>Hand Raise (3/5)</TooltipTitle>
                  <TooltipText>
                     Once connected, the viewer who raised their hand will
                     appear as an additional streamer
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
            {remoteStreamItem}
         </WhiteTooltip>
      )
   }

   return remoteStreamItem
}

function generateDemoHandRaiser(stream) {
   let video = document.createElement("video")
   const videoContainer = document.querySelector("#" + stream.uid)
   videoContainer.style.zIndex = 1000
   videoContainer.style.backgroundColor = "black"
   videoContainer.appendChild(video)
   video.src = stream.url
   video.loop = true
   video.play()
}

export default RemoteStreamItem
