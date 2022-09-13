import React, { useEffect, useState } from "react"
import LocalStreamItem from "./LocalStreamItem"
import RemoteStreamItem from "./RemoteStreamItem"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"

const StreamContainer = ({
   stream,
   big,
   liveSpeakers,
   index,
   videoMutedBackgroundImg,
   livestreamId,
}) => {
   const { getUserData } = useFirebaseService()
   const [speaker, setSpeaker] = useState(null)
   const [fetching, setFetching] = useState(false)
   useEffect(() => {
      ;(async () => {
         if (speaker || fetching) return
         let newSpeaker
         if (stream.uid === "demoStream") {
            newSpeaker = {
               firstName: "Demo",
               lastName: "Speaker",
               position: "✋ Hand Raiser",
            }
         } else if (stream.uid.includes?.("screen")) {
            newSpeaker = null
         } else {
            newSpeaker = liveSpeakers?.find(
               (speaker) => speaker.speakerUuid === stream.uid
            )
            if (!newSpeaker && stream.uid && livestreamId) {
               const userId = stream.uid.replace?.(livestreamId, "")
               if (userId) {
                  newSpeaker = await getSpeakerInfoFromDB(userId)
               }
            }
         }
         setSpeaker(newSpeaker)
      })()
   }, [stream.uid.includes?.("screen"), liveSpeakers, stream.uid])

   const getSpeakerInfoFromDB = async (userId) => {
      let fetchedSpeaker = {
         firstName: "Anonymous",
         lastName: "",
         position: "✋ Hand Raiser",
      }
      try {
         setFetching(true)
         const userSnap = await getUserData(userId)
         if (userSnap.exists) {
            const userData = userSnap.data()
            fetchedSpeaker = {
               firstName: userData.firstName || "",
               lastName: userData?.lastName?.[0] || "",
               position: "✋ Hand Raiser",
            }
         }
      } catch (e) {
         return fetchedSpeaker
      }
      setFetching(false)
      return fetchedSpeaker
   }

   return stream.isLocal ? (
      <LocalStreamItem
         big={big}
         stream={stream}
         index={index}
         speaker={speaker}
         videoMutedBackgroundImg={videoMutedBackgroundImg}
      />
   ) : (
      <RemoteStreamItem
         big={big}
         index={index}
         stream={stream}
         speaker={speaker}
         videoMutedBackgroundImg={videoMutedBackgroundImg}
      />
   )
}

export default StreamContainer
