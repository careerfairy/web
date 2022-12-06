import React, { useContext, useEffect, useState } from "react"
import { MAX_STREAM_CHAT_ENTRIES } from "../../constants/streams"
import useStreamRef from "./useStreamRef"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"
import { LivestreamChatEntry } from "@careerfairy/shared-lib/dist/livestreams"
import * as actions from "../../store/actions"
import { Button } from "@mui/material"
import { useDispatch } from "react-redux"
import { useAuth } from "../../HOCs/AuthProvider"
import { useTheme } from "@mui/material/styles"
import TutorialContext from "../../context/tutorials/TutorialContext"
import { useCurrentStream } from "../../context/stream/StreamContext"
import firebase from "firebase/compat"
import DocumentChange = firebase.firestore.DocumentChange
import { Dispatch } from "redux"
const now = new Date()

const useStreamChat = () => {
   const { currentLivestream, isStreamer } = useCurrentStream()
   const [chatEntries, setChatEntries] = useState<LivestreamChatEntry[]>([])
   const { authenticatedUser, userData } = useAuth()
   const firebase = useFirebaseService()
   const dispatch = useDispatch()
   const theme = useTheme()
   const { tutorialSteps, setTutorialSteps, handleConfirmStep } =
      useContext(TutorialContext)
   const streamRef = useStreamRef()
   const [focused, setFocused] = useState(false)
   const [submitting, setSubmitting] = useState(false)
   const [currentEntry, setCurrentEntry] = useState(null)
   const [numberOfMissedEntries, setNumberOfMissedEntries] = useState(0)
   const [numberOfLatestChanges, setNumberOfLatestChanges] = useState(0)

   const [newChatEntry, setNewChatEntry] = useState("")
   const [open, setOpen] = useState(false)

   const isEmpty =
      !newChatEntry.trim() ||
      (!userData &&
         !currentLivestream.test &&
         !currentLivestream.openStream &&
         !isStreamer)

   useEffect(() => {
      if (currentLivestream.id) {
         const unsubscribe = firebase.listenToChatEntries(
            streamRef,
            MAX_STREAM_CHAT_ENTRIES,
            (querySnapshot) => {
               const newEntries = querySnapshot.docs
                  .map((doc) => ({ id: doc.id, ...doc.data() }))
                  .reverse()
               setChatEntries(newEntries)
               querySnapshot.docChanges().forEach((change) => {
                  let number = 0
                  if (change.type === "added") {
                     handleBroadcast(change, dispatch)
                     if (!open && number < 99) {
                        number++
                        setNumberOfLatestChanges(number)
                     }
                  }
               })
            }
         )
         return () => unsubscribe()
      }
   }, [currentLivestream.id, dispatch, firebase, open, streamRef])

   return null
}

const handleBroadcast = (
   change: DocumentChange<LivestreamChatEntry>,
   dispatch: Dispatch<any>
) => {
   const entryData = change.doc.data()
   if (entryData.type === "broadcast") {
      const isNewBroadcast = entryData.timestamp?.toDate() > now
      if (isNewBroadcast) {
         const { authorName, message } = entryData
         const broadCastMessage = `${authorName} - ${message}`
         const handleCloseAction = () =>
            dispatch(actions.closeSnackbar(broadCastMessage))
         const action = (
            <Button sx={{ color: "white" }} onClick={handleCloseAction}>
               Dismiss
            </Button>
         )
         dispatch(actions.enqueueBroadcastMessage(broadCastMessage, action))
      }
   }
}
export default useStreamChat
