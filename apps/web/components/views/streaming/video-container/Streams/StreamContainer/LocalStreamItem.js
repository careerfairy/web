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
         audioMuted={stream.audioMuted === undefined ? true : stream.audioMuted}
         big={big}
      />
   )
}

export default LocalStreamItem
