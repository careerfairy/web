import React, { memo, useEffect, useState } from "react"
import StreamsLayout from "./StreamsLayout"
import Banners from "./Banners"
import { useSelector } from "react-redux"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import SuperAdminControls from "../SuperAdminControls"
import { focusModeEnabledSelector } from "../../../../../store/selectors/streamSelectors"
import { IRemoteStream, LocalStream } from "../../../../../types/streaming"
import { LiveSpeaker } from "@careerfairy/shared-lib/dist/livestreams"
import FloatingHelpButton from "../../sharedComponents/FloatingHelpButton"
import Box from "@mui/material/Box"
import { sxStyles } from "../../../../../types/commonTypes"

const styles = sxStyles({
   root: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: (theme) => theme.palette.grey["900"],
   },
   videoElementsWrapper: {
      flex: 1,
      display: "flex",
   },
   floatingButtonWrapper: {
      position: "absolute",
      p: 1,
   },
})

interface Props {
   externalMediaStreams: IRemoteStream[]
   localMediaStream: LocalStream
   currentSpeakerId?: string
   sharingScreen: boolean
   isBroadCasting: boolean
   liveSpeakers: LiveSpeaker[]
   sharingPdf: boolean
   showMenu: boolean
   livestreamId: string
   presenter?: boolean
   videoMutedBackgroundImg: string
   handRaiseActive: boolean
   mobile?: boolean
   viewer?: boolean
   streamerId: string
   sharingVideo: boolean
   openSupportInLeftMenu?: () => void
}
const Streams = ({
   externalMediaStreams,
   localMediaStream,
   currentSpeakerId,
   sharingScreen,
   isBroadCasting,
   liveSpeakers,
   sharingPdf,
   showMenu,
   livestreamId,
   presenter,
   videoMutedBackgroundImg,
   handRaiseActive,
   mobile,
   viewer,
   streamerId,
   sharingVideo,
   openSupportInLeftMenu,
}: Props) => {
   const focusModeEnabled = useSelector(focusModeEnabledSelector)
   const [streamData, setStreamData] = useState([])
   const [bannersBottom, setBannersBottom] = useState(false)
   const [hasManySpeakers, setHasManySpeakers] = useState(false)
   const { userData } = useAuth()

   useEffect(() => {
      setBannersBottom(Boolean((mobile || focusModeEnabled) && !presenter))
   }, [mobile, presenter, focusModeEnabled])

   useEffect(() => {
      const allStreams: (IRemoteStream | LocalStream)[] = [
         ...externalMediaStreams,
      ]
      const newHasManySpeakers = Boolean(allStreams?.length > 4)
      setHasManySpeakers(newHasManySpeakers)
      if (
         localMediaStream &&
         localMediaStream.isAudioPublished &&
         isBroadCasting
      ) {
         allStreams.unshift(localMediaStream)
      }
      if (!hasManySpeakers && sharingPdf) {
         setStreamData(allStreams)
         return
      }
      let newLargeStream = handleGetLargeStream(allStreams, currentSpeakerId)
      if (!newLargeStream) {
         setStreamData([])
         return
      }
      let newSmallStreams = handleGetSmallStream(allStreams, newLargeStream)
      setStreamData([...newSmallStreams, newLargeStream])
   }, [
      externalMediaStreams,
      localMediaStream,
      currentSpeakerId,
      isBroadCasting,
      sharingScreen,
      sharingPdf,
      sharingVideo,
   ])

   const handleGetLargeStream = (allStreams, currentSpeakerId) => {
      let screenShareStream
      let currentSpeakerStream
      let localStream

      for (const stream of allStreams) {
         if (stream.uid.includes?.("screen")) {
            screenShareStream = stream
         }
         if (stream.uid === currentSpeakerId) {
            currentSpeakerStream = stream
         }

         if (stream.isLocal) {
            localStream = stream
         }
      }

      if (screenShareStream) return screenShareStream

      if (currentSpeakerStream) return currentSpeakerStream

      if (localStream) return localStream

      if (!currentSpeakerStream && !screenShareStream && allStreams.length)
         return allStreams[0]

      return null
   }

   const handleGetSmallStream = (allStreams, largeStream) => {
      return allStreams.filter((stream) => stream.uid !== largeStream.uid)
   }
   return (
      <Box sx={styles.root}>
         {!bannersBottom && (
            <Banners
               presenter={presenter}
               handRaiseActive={handRaiseActive}
               mobile={mobile}
            />
         )}
         <Box sx={styles.videoElementsWrapper}>
            {presenter && (
               <Box sx={styles.floatingButtonWrapper}>
                  <FloatingHelpButton
                     openSupportInLeftMenu={openSupportInLeftMenu}
                  />
               </Box>
            )}
            <StreamsLayout
               streamData={streamData}
               liveSpeakers={liveSpeakers}
               sharingPdf={sharingPdf}
               hasManySpeakers={hasManySpeakers}
               sharingScreen={sharingScreen}
               videoMutedBackgroundImg={videoMutedBackgroundImg}
               currentSpeakerId={currentSpeakerId}
               showMenu={showMenu}
               livestreamId={livestreamId}
               presenter={presenter}
               sharingVideo={sharingVideo}
               viewer={viewer}
               streamerId={streamerId}
               handRaiseActive={handRaiseActive}
            />
            {userData?.isAdmin && <SuperAdminControls />}
         </Box>
         {bannersBottom && (
            <Banners
               isBottom
               presenter={presenter}
               handRaiseActive={handRaiseActive}
               mobile={mobile}
            />
         )}
      </Box>
   )
}

export default memo(Streams)
