import { EmoteEntity } from "context/agora/RTMContext"
import { useCurrentStream } from "context/stream/StreamContext"
import { firebaseServiceInstance } from "data/firebase/FirebaseService"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setEmote } from "store/actions"
import { sessionRTMFailedToJoin } from "store/selectors/streamSelectors"

/**
 * Listens to future emotes in firestore and dispatches them to the redux
 * Only works when RTM fails to join
 */
export const useFallbackEmotes = (livestreamId: string) => {
   const rtmFailedToJoin = useSelector(sessionRTMFailedToJoin)
   const dispatch = useDispatch()
   const { streamerId } = useCurrentStream()

   useEffect(() => {
      if (!rtmFailedToJoin) return

      return firebaseServiceInstance.listenToFutureLivestreamIcons(
         livestreamId,
         (snap) => {
            const emotes: EmoteEntity[] = snap
               .docChanges()
               .filter((change) => change.type == "added")
               .map((d) => d.doc)
               .filter((d) => d.get("streamerId") !== streamerId)
               .map((doc) => ({
                  textType: "EMOTE",
                  emoteType: doc.get("name"),
                  timestamp: doc.get("timestamp").toDate().getTime(),
               }))

            emotes.forEach((emote) => {
               dispatch(setEmote(emote, ""))
            })
         }
      )
   }, [dispatch, livestreamId, rtmFailedToJoin, streamerId])
}
