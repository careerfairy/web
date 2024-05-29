import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LivestreamEmote } from "@careerfairy/shared-lib/livestreams"
import { useAppDispatch } from "components/custom-hook/store"
import { useWindowVisibility } from "components/custom-hook/utils/useWindowVisibility"
import {
   collection,
   limit,
   onSnapshot,
   orderBy,
   query,
   where,
} from "firebase/firestore"
import { useEffect, useRef } from "react"
import { useFirestore } from "reactfire"
import { addEmote } from "store/reducers/streamingAppReducer"
import { useFailedToConnectToRTM } from "store/selectors/streamingAppSelectors"

const now = new Date()

/**
 * Custom hook to track emotes in a live stream when RTM connection fails.
 *
 * @param {string} livestreamId - The ID of the live stream.
 * @param {string} agoraUserId - The ID of the Agora user.
 * @returns {void}
 */
export const useFallbackTrackEmotes = (
   livestreamId: string,
   agoraUserId: string
): void => {
   const dispatch = useAppDispatch()
   const firestore = useFirestore()

   const isWindowVisible = useWindowVisibility()
   const failedToConnectToRTM = useFailedToConnectToRTM()

   const isWindowVisibleRef = useRef(isWindowVisible)
   isWindowVisibleRef.current = isWindowVisible

   useEffect(() => {
      if (failedToConnectToRTM) {
         return onSnapshot(
            query(
               collection(firestore, "livestreams", livestreamId, "icons"),
               where("timestamp", ">", now),
               orderBy("timestamp", "desc"),
               limit(30)
            ).withConverter(createGenericConverter<LivestreamEmote>()),
            (snapshot) => {
               // Don't queue up emotes that have added when you're not focused on the window
               if (!isWindowVisibleRef.current) return

               const newEmotes = snapshot.docChanges().filter(
                  (change) =>
                     change.type === "added" && // only new additions
                     change.doc.data().agoraUserId !== agoraUserId // not from the current user
               )

               newEmotes.forEach((emote) => {
                  dispatch(addEmote(emote.doc.data().name))
               })
            }
         )
      }
   }, [agoraUserId, dispatch, failedToConnectToRTM, firestore, livestreamId])
}
