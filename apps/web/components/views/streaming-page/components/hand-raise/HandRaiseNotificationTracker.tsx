import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   HandRaise,
   HandRaiseState,
} from "@careerfairy/shared-lib/livestreams/hand-raise"
import { LoadingButton } from "@mui/lab"
import { Stack, Typography } from "@mui/material"
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
import { useStreamingContext } from "../../context"

export const HandRaiseNotificationTracker = () => {
   const { livestreamId, isHost } = useStreamingContext()
   const {
      trigger: updateUserHandRaiseState,
      isMutating: isUpdatingUserHandRaiseState,
   } = useUpdateUserHandRaiseState(livestreamId)

   const initialLoaded = useRef(false)

   const db = useFirestore()

   const { enqueueSnackbar, closeSnackbar } = useSnackbar()

   useEffect(() => {
      if (livestreamId && isHost) {
         return onSnapshot(
            query(
               collection(db, "livestreams", livestreamId, "handRaises"),
               where("state", "in", [
                  HandRaiseState.requested,
                  HandRaiseState.connected,
               ]),
               orderBy("timeStamp", "desc")
            ).withConverter(createGenericConverter<HandRaise>()),
            (snapshot) => {
               snapshot.docChanges().forEach((change) => {
                  if (change.type === "removed") return

                  const handRaiser = change.doc.data()

                  closeSnackbar(handRaiser.id)
                  if (!initialLoaded.current) return

                  if (handRaiser.state === HandRaiseState.requested) {
                     enqueueSnackbar(
                        `${handRaiser.name} has raised their hand.`,
                        {
                           variant: "info",
                           key: handRaiser.id,
                           content: (key, message) => (
                              <HandRaiseRequestedNotification
                                 handRaise={handRaiser}
                                 livestreamId={livestreamId}
                                 key={key}
                                 message={message}
                              />
                           ),
                        }
                     )
                  }

                  if (handRaiser.state === HandRaiseState.connecting) {
                     enqueueSnackbar(
                        `${handRaiser.name} is connecting to the panel`,
                        {
                           variant: "info",
                           key: handRaiser.id,
                           content: (key, message) => (
                              <CustomNotification
                                 title="Hand raiser"
                                 variant="info"
                                 id={key}
                                 content={message}
                              />
                           ),
                        }
                     )
                  }

                  if (handRaiser.state === HandRaiseState.connected) {
                     enqueueSnackbar(
                        `${handRaiser.name} has joined the panel`,
                        {
                           variant: "info",
                           key: handRaiser.id,
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
   ])

   return null
}

type HandRaiseNotificationProps = {
   handRaise: HandRaise
   livestreamId: string
   message: ReactNode
   key: SnackbarKey
}

const HandRaiseRequestedNotification = forwardRef<
   HTMLDivElement,
   HandRaiseNotificationProps
>(({ handRaise, livestreamId, message, key }, ref) => {
   const {
      trigger: updateUserHandRaiseState,
      isMutating: isUpdatingUserHandRaiseState,
   } = useUpdateUserHandRaiseState(livestreamId)

   return (
      <CustomNotification
         id={key}
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
                           state: HandRaiseState.denied,
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
