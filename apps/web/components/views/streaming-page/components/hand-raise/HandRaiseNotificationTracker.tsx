import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   HandRaise,
   HandRaiseState,
} from "@careerfairy/shared-lib/livestreams/hand-raise"
import { LoadingButton } from "@mui/lab"
import { Stack } from "@mui/material"
import { useUpdateUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUpdateUserHandRaiseState"
import {
   collection,
   onSnapshot,
   orderBy,
   query,
   where,
} from "firebase/firestore"
import { useSnackbar } from "notistack"
import { useEffect, useRef } from "react"
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
                  HandRaiseState.connecting,
                  HandRaiseState.connected,
               ]),
               orderBy("timeStamp", "desc")
            ).withConverter(createGenericConverter<HandRaise>()),
            (snapshot) => {
               snapshot.docChanges().forEach((change) => {
                  if (change.type === "removed") return

                  const handRaiser = change.doc.data()
                  const snackbarKey = change.doc.id
                  closeSnackbar(snackbarKey) // close the snackbar if it exists

                  if (!initialLoaded.current) return

                  if (handRaiser.state === HandRaiseState.requested) {
                     enqueueSnackbar(
                        `${handRaiser.name} requested to raise their hand`,
                        {
                           variant: "info",
                           key: change.doc.id,
                           preventDuplicate: true,
                           action: (key) => (
                              <Stack
                                 justifyContent="flex-end"
                                 direction="row"
                                 spacing={1}
                              >
                                 <LoadingButton
                                    loading={isUpdatingUserHandRaiseState}
                                    onClick={async () => {
                                       await updateUserHandRaiseState({
                                          state: HandRaiseState.denied,
                                          handRaiseId: handRaiser.id,
                                       })
                                       closeSnackbar(key)
                                    }}
                                    variant="outlined"
                                    color="grey"
                                    size="small"
                                 >
                                    Deny
                                 </LoadingButton>
                                 <LoadingButton
                                    loading={isUpdatingUserHandRaiseState}
                                    onClick={async () => {
                                       await updateUserHandRaiseState({
                                          state: HandRaiseState.invited,
                                          handRaiseId: handRaiser.id,
                                       })
                                       closeSnackbar(key)
                                    }}
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                 >
                                    Approve
                                 </LoadingButton>
                              </Stack>
                           ),
                        }
                     )
                  }

                  if (handRaiser.state === HandRaiseState.connected) {
                     enqueueSnackbar(`${handRaiser.name} joined the panel`, {
                        variant: "info",
                        preventDuplicate: true,
                        key: change.doc.id,
                     })
                  }

                  if (handRaiser.state === HandRaiseState.connecting) {
                     enqueueSnackbar(
                        `${handRaiser.name} is connecting to the panel`,
                        {
                           variant: "info",
                           preventDuplicate: true,
                           key: change.doc.id,
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
