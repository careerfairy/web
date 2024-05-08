import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   HandRaise,
   HandRaiseState,
} from "@careerfairy/shared-lib/livestreams/hand-raise"
import { LoadingButton } from "@mui/lab"
import { Stack, Typography } from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import { useUpdateUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUpdateUserHandRaiseState"
import CustomNotification from "components/views/notifications/CustomNotification"
import {
   collection,
   onSnapshot,
   orderBy,
   query,
   where,
} from "firebase/firestore"
import { SnackbarKey, useSnackbar } from "notistack"
import { ReactNode, forwardRef, useEffect, useRef } from "react"
import { useFirestore } from "reactfire"
import { incrementNumberOfHandRaiseNotifications } from "store/reducers/streamingAppReducer"
import { useStreamingContext } from "../../context"

const buildKey = (handRaise: HandRaise) => `${handRaise.id}-${handRaise.state}`

export const HandRaiseNotificationTracker = () => {
   const { livestreamId, isHost } = useStreamingContext()
   const dispatch = useAppDispatch()
   const activeNotifications = useRef<SnackbarKey[]>([])

   const {
      trigger: updateUserHandRaiseState,
      isMutating: isUpdatingUserHandRaiseState,
   } = useUpdateUserHandRaiseState(livestreamId)

   const initialLoaded = useRef(false)

   const db = useFirestore()

   const { enqueueSnackbar, closeSnackbar } = useSnackbar()

   useEffect(() => {
      if (livestreamId && isHost) {
         if (isUpdatingUserHandRaiseState) return
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
   }, [
      livestreamId,
      isHost,
      db,
      enqueueSnackbar,
      isUpdatingUserHandRaiseState,
      updateUserHandRaiseState,
      closeSnackbar,
      dispatch,
   ])

   return null
}

type HandRaiseNotificationProps = {
   handRaise: HandRaise
   livestreamId: string
   message: ReactNode
   id: SnackbarKey
}

const HandRaiseRequestedNotification = forwardRef<
   HTMLDivElement,
   HandRaiseNotificationProps
>(({ handRaise, livestreamId, message, id }, ref) => {
   const {
      trigger: updateUserHandRaiseState,
      isMutating: isUpdatingUserHandRaiseState,
   } = useUpdateUserHandRaiseState(livestreamId)

   return (
      <CustomNotification
         id={id}
         ref={ref}
         title="New hand raiser"
         variant="success"
         content={
            <Stack direction="row" alignItems="center" spacing={1.25}>
               <Typography variant="small">{message}</Typography>
               <Stack direction="row" spacing={1}>
                  <LoadingButton
                     loading={isUpdatingUserHandRaiseState}
                     onClick={() =>
                        updateUserHandRaiseState({
                           state: HandRaiseState.unrequested,
                           handRaiseId: handRaise.id,
                        })
                     }
                     size="small"
                     color="grey"
                     variant="outlined"
                  >
                     Deny
                  </LoadingButton>
                  <LoadingButton
                     loading={isUpdatingUserHandRaiseState}
                     onClick={() =>
                        updateUserHandRaiseState({
                           state: HandRaiseState.invited,
                           handRaiseId: handRaise.id,
                        })
                     }
                     size="small"
                     color="primary"
                     variant="contained"
                  >
                     Approve
                  </LoadingButton>
               </Stack>
            </Stack>
         }
      />
   )
})

HandRaiseRequestedNotification.displayName = "HandRaiseRequestedNotification"
