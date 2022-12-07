import React, {
   KeyboardEventHandler,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { Box, Button, Collapse, IconButton, TextField } from "@mui/material"
import {
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "../../../../../materialUI/GlobalTooltips"
import { sxStyles } from "../../../../../types/commonTypes"
import { alpha } from "@mui/material/styles"
import { grey } from "@mui/material/colors"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import { useDispatch } from "react-redux"
import TutorialContext from "../../../../../context/tutorials/TutorialContext"
import useStreamRef from "../../../../custom-hook/useStreamRef"
import { MAX_STREAM_CHAT_ENTRIES } from "../../../../../constants/streams"
import * as actions from "../../../../../store/actions"
import { LivestreamChatEntry } from "@careerfairy/shared-lib/dist/livestreams"
import { dataLayerLivestreamEvent } from "../../../../../util/analyticsUtils"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import { useCurrentStream } from "../../../../../context/stream/StreamContext"
import { Dispatch } from "redux"
import firebase from "firebase/compat"
import CustomScrollToBottom from "../../../../util/CustomScrollToBottom"
import ChatEntryContainer from "./ChatEntryContainer"
import EmotesModal from "./EmotesModal"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import { SystemStyleObject } from "@mui/system/styleFunctionSx/styleFunctionSx"
import DocumentChange = firebase.firestore.DocumentChange
import ConfirmDeleteModal from "../../modal/ConfirmDeleteModal"
import { errorLogAndNotify } from "../../../../../util/CommonUtil"

const styles = sxStyles({
   sendIcon: {
      background: "white",
      color: "black",
      borderRadius: "50%",
      fontSize: 15,
   },
   sendIconEmpty: {
      color: "grey",
   },
   sendBtn: {
      background: (theme) => alpha(theme.palette.primary.main, 0.5),
      "&$buttonDisabled": {
         color: grey[800],
      },
      "&:hover": {
         backgroundColor: "primary.main",
      },
      margin: "0.5rem",
   },
   chatInput: {
      overflow: "hidden",
      borderRadius: 2,
      "& .MuiInputBase-root": {
         paddingRight: "0 !important",
         borderRadius: 2,
      },
   },
   scrollToBottom: {
      backgroundColor: (theme) => theme.palette.background.default,
      height: "240px",
      "& > div": {
         padding: 1.4,
         overflowX: "hidden",
      },
   },
   textWrapper: {
      backgroundColor: (theme) => theme.palette.background.paper,
      p: 0.5,
   },
})

const now = new Date()

type Props = {
   setNumberOfMissedEntries?: React.Dispatch<React.SetStateAction<number>>
   onChatEntryAdded?: () => void
   notVisible?: boolean
   scrollToBottomSx?: SystemStyleObject<DefaultTheme>
}
const ChatWidget = ({
   setNumberOfMissedEntries,
   onChatEntryAdded,
   notVisible,
   scrollToBottomSx,
}: Props) => {
   const firebase = useFirebaseService()
   const dispatch = useDispatch()
   const streamRef = useStreamRef()
   const { isStreamer, currentLivestream, presenter } = useCurrentStream()
   const { authenticatedUser, userData, adminGroups } = useAuth()
   const { tutorialSteps, handleConfirmStep } = useContext(TutorialContext)

   const [chatEntryIdToDelete, setChatEntryIdToDelete] = useState(null)
   const [chatEntries, setChatEntries] = useState([])
   const [focused, setFocused] = useState(false)
   const [submitting, setSubmitting] = useState(false)
   const [currentEntry, setCurrentEntry] = useState(null)
   const [numberOfLatestChanges, setNumberOfLatestChanges] = useState(0)
   const [newChatEntry, setNewChatEntry] = useState("")
   const [deletingChatEntry, setDeletingChatEntry] = useState(false)

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
                     if (notVisible && number < 99) {
                        number++
                        setNumberOfLatestChanges(number)
                     }
                  }
               })
            }
         )
         return () => unsubscribe()
      }
   }, [currentLivestream.id])

   useEffect(() => {
      setNumberOfMissedEntries?.((prevMissedEntries) => {
         if (prevMissedEntries + numberOfLatestChanges <= 100 && notVisible) {
            return prevMissedEntries + numberOfLatestChanges
         }
         return prevMissedEntries
      })
      setNumberOfLatestChanges(0)
   }, [numberOfLatestChanges])

   useEffect(() => {
      if (tutorialSteps.streamerReady) {
         setNumberOfMissedEntries?.(3) // resets the missed entries back to 3
      }
   }, [tutorialSteps.streamerReady])

   const isStreamAdmin = useMemo(
      () => presenter.isStreamAdmin(adminGroups),
      [adminGroups, presenter]
   )

   const isOpen = (property) => {
      return Boolean(
         currentLivestream.test &&
            tutorialSteps.streamerReady &&
            tutorialSteps[property]
      )
   }

   const handleSetCurrentEntry = useCallback((chatEntry) => {
      setCurrentEntry(chatEntry)
   }, [])

   const handleClearCurrentEntry = () => {
      setCurrentEntry(null)
   }

   const getAuthorName = () => {
      let name = "anonymous"
      if (currentLivestream.openStream) return name
      if (userData) {
         return userData.firstName + " " + userData.lastName.charAt(0)
      }
      if (isStreamer || currentLivestream.test) return "Streamer"
      return name
   }

   const getAuthorEmail = () => {
      let name = "anonymous"
      if (currentLivestream.openStream) return name
      if (authenticatedUser.email) return authenticatedUser.email
      if (isStreamer || currentLivestream.test) return "Streamer"
      return name
   }

   const addNewChatEntry = () => {
      if (isEmpty || submitting) {
         return
      }
      setSubmitting(true)

      const newChatEntryObject: Partial<LivestreamChatEntry> = {
         message: newChatEntry,
         authorName: getAuthorName(),
         authorEmail: getAuthorEmail(),
         ...(isStreamer && {
            type: "streamer",
         }),
      }

      isOpen(15) && handleConfirmStep(15)
      firebase.putChatEntry(streamRef, newChatEntryObject).then(
         () => {
            setSubmitting(false)
            setNewChatEntry("")
         },
         (error) => {
            setSubmitting(false)
            console.log("Error: " + error)
         }
      )
   }

   const addNewChatEntryOnEnter: KeyboardEventHandler = (event) => {
      if (event.key === "Enter") {
         addNewChatEntry()
         onChatEntryAdded?.()

         dataLayerLivestreamEvent(
            "livestream_chat_new_message",
            currentLivestream
         )
      }
   }

   const handleDeleteChatEntry = useCallback(async () => {
      try {
         setDeletingChatEntry(true)
         await firebase.deleteChatEntry(streamRef, chatEntryIdToDelete)
         setChatEntryIdToDelete(null)
      } catch (e) {
         errorLogAndNotify(e, {
            message: "Error deleting chat entry",
         })
      }
      setDeletingChatEntry(false)
   }, [chatEntryIdToDelete, firebase, streamRef])

   const handleCloseDeleteChatEntryDialog = useCallback(() => {
      setChatEntryIdToDelete(null)
   }, [])

   const playIcon = (
      <div>
         <IconButton
            sx={styles.sendBtn}
            disabled={isEmpty}
            onClick={() => addNewChatEntry()}
            size="large"
         >
            <ChevronRightRoundedIcon
               sx={[styles.sendIcon, isEmpty && styles.sendIconEmpty]}
            />
         </IconButton>
      </div>
   )

   if (notVisible) {
      return null
   }
   return (
      <>
         <Box
            component={CustomScrollToBottom}
            sx={[styles.scrollToBottom, scrollToBottomSx]}
            scrollItems={chatEntries.map((chatEntry, index, entries) => (
               <ChatEntryContainer
                  handleSetCurrentEntry={handleSetCurrentEntry}
                  last={index === entries.length - 1}
                  key={chatEntry.id}
                  chatEntry={chatEntry}
                  setChatEntryIdToDelete={setChatEntryIdToDelete}
                  userIsStreamer={isStreamer}
                  isStreamAdmin={isStreamAdmin}
               />
            ))}
         />
         <WhiteTooltip
            placement="top"
            title={
               <React.Fragment>
                  <TooltipTitle>Chat (2/2)</TooltipTitle>
                  <TooltipText>Give it a shot!</TooltipText>
               </React.Fragment>
            }
            open={isOpen(15)}
         >
            <Box sx={styles.textWrapper}>
               <TextField
                  variant="outlined"
                  fullWidth
                  autoFocus
                  onBlur={() => setFocused(false)}
                  onFocus={() => setFocused(true)}
                  sx={styles.chatInput}
                  size="small"
                  onKeyDown={addNewChatEntryOnEnter}
                  value={newChatEntry}
                  onChange={(event) => setNewChatEntry(event.target.value)}
                  placeholder="Post in the chat..."
                  InputProps={{
                     // @ts-ignore
                     maxLength: 340,
                     endAdornment: playIcon,
                  }}
               />
               {!currentLivestream?.questionsDisabled && (
                  <Collapse
                     style={{
                        color: "grey",
                        fontSize: "0.8em",
                        marginTop: 3,
                        padding: "0 0.8em",
                     }}
                     in={focused && !isStreamer}
                  >
                     For questions, please use the Q&A tool!
                  </Collapse>
               )}
            </Box>
         </WhiteTooltip>
         <EmotesModal
            chatEntry={currentEntry}
            onClose={handleClearCurrentEntry}
         />
         {chatEntryIdToDelete && (
            <ConfirmDeleteModal
               description={
                  "Are you sure you want to delete this message? This action cannot be undone."
               }
               title={"Delete question"}
               loading={deletingChatEntry}
               onClose={handleCloseDeleteChatEntryDialog}
               onConfirm={handleDeleteChatEntry}
            />
         )}
      </>
   )
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

export default ChatWidget
