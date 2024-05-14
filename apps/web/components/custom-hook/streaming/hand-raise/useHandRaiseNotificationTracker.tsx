import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   HandRaise,
   HandRaiseState,
} from "@careerfairy/shared-lib/livestreams/hand-raise"
import { useAppDispatch } from "components/custom-hook/store"
import CustomNotification from "components/views/notifications/CustomNotification"
import {
   collection,
   onSnapshot,
   orderBy,
   query,
   where,
} from "firebase/firestore"
import { SnackbarKey, useSnackbar } from "notistack"
import { useEffect, useRef } from "react"
import { useFirestore } from "reactfire"
import {
   incrementNumberOfHandRaiseNotifications,
   resetNumberOfHandRaiseNotifications,
} from "store/reducers/streamingAppReducer"
import { HandRaiseRequestedNotification } from "../../../views/streaming-page/components/hand-raise/HandRaiseRequestedNotification"

const buildKey = (handRaise: HandRaise) => `${handRaise.id}-${handRaise.state}`

export const useHandRaiseNotificationTracker = (
   livestreamId: string,
   disabled: boolean
) => {
   const dispatch = useAppDispatch()
   const activeNotifications = useRef<SnackbarKey[]>([])

   const initialLoaded = useRef(false)
   const disabledRef = useRef(disabled)
   disabledRef.current = disabled

   const db = useFirestore()

   const { enqueueSnackbar, closeSnackbar } = useSnackbar()

   useEffect(() => {
      if (disabled) {
         dispatch(resetNumberOfHandRaiseNotifications())
      }
   }, [disabled, dispatch])

   useEffect(() => {
      if (livestreamId) {
         return onSnapshot(
            query(
               collection(db, "livestreams", livestreamId, "handRaises"),
               where("state", "in", [
                  HandRaiseState.requested,
                  HandRaiseState.connecting,
                  HandRaiseState.connected,
               ]),
               orderBy("timeStamp", "desc")
            ).withConverter(createGenericConverter<HandRaise>()),
            (snapshot) => {
               if (disabledRef.current) return

               snapshot.docChanges().forEach((change) => {
                  let notificationKey: SnackbarKey | undefined
                  const handRaiser = change.doc.data()

                  activeNotifications.current.forEach((key) => {
                     if (key.toString().includes(handRaiser.id)) {
                        closeSnackbar(key)
                     }
                  })

                  if (change.type === "removed") {
                     if (handRaiser.state === HandRaiseState.requested) {
                        dispatch(incrementNumberOfHandRaiseNotifications(-1))
                     }
                     return
                  }

                  if (handRaiser.state === HandRaiseState.requested) {
                     dispatch(incrementNumberOfHandRaiseNotifications(1))
                  }

                  // Don't show previous/old notifications on page load
                  if (!initialLoaded.current) return

                  if (handRaiser.state === HandRaiseState.requested) {
                     notificationKey = enqueueSnackbar(
                        `${handRaiser.name} has raised their hand.`,
                        {
                           variant: "info",
                           key: buildKey(handRaiser),
                           content: (key, message) => (
                              <HandRaiseRequestedNotification
                                 handRaise={handRaiser}
                                 livestreamId={livestreamId}
                                 id={key}
                                 message={message}
                              />
                           ),
                        }
                     )
                  }

                  if (handRaiser.state === HandRaiseState.connecting) {
                     notificationKey = enqueueSnackbar(
                        `${handRaiser.name} is connecting to the panel`,
                        {
                           variant: "info",
                           key: buildKey(handRaiser),
                           content: (key, message) => (
                              <CustomNotification
                                 title="Hand raiser"
                                 variant="success"
                                 id={key}
                                 content={message}
                              />
                           ),
                        }
                     )
                  }

                  if (handRaiser.state === HandRaiseState.connected) {
                     notificationKey = enqueueSnackbar(
                        `${handRaiser.name} has joined the panel`,
                        {
                           variant: "info",
                           key: buildKey(handRaiser),
                           content: (key, message) => (
                              <CustomNotification
                                 title="Hand raiser"
                                 variant="success"
                                 id={key}
                                 content={message}
                              />
                           ),
                        }
                     )
                  }

                  if (notificationKey) {
                     activeNotifications.current.push(notificationKey)
                  }
               })
               initialLoaded.current = true
            }
         )
      }
   }, [livestreamId, db, enqueueSnackbar, closeSnackbar, dispatch])

   return null
}
