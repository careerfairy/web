import React, { useEffect } from "react"
import StreamItem from "./StreamItem"

const LocalStreamItem = ({ stream, big, speaker, videoMutedBackgroundImg }) => {
   useEffect(() => {
      if (stream.videoTrack && !stream.videoTrack.isPlaying) {
         stream.videoTrack.play(stream.uid)
      }
   }, [stream.uid, stream.videoTrack])

   return (
      <StreamItem
         speaker={speaker}
         videoMutedBackgroundImg={videoMutedBackgroundImg}
         stream={stream}
         videoMuted={!stream.videoTrack || stream.videoMuted}
         audioMuted={isLocalStreamMuted(stream)}
         big={big}
      />
   )
}

function isLocalStreamMuted(stream) {
   // local streamer will publish the audiotrack, but initially it will not have the
   // audioMuted field set
   if (stream.audioMuted) {
      return true
   }

   return false
}

export default LocalStreamItem
