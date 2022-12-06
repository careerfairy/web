import React, {
   KeyboardEventHandler,
   useCallback,
   useEffect,
   useState,
} from "react"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { grey } from "@mui/material/colors"
import { Box, IconButton, TextField } from "@mui/material"
import { alpha } from "@mui/material/styles"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import ChatEntryContainer from "./chat/ChatEntryContainer"
import CustomScrollToBottom from "../../../../util/CustomScrollToBottom"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import EmotesModal from "./chat/EmotesModal"
import useStreamRef from "../../../../custom-hook/useStreamRef"
import { MAX_STREAM_CHAT_ENTRIES } from "../../../../../constants/streams"
import {
   LivestreamChatEntry,
   LivestreamEvent,
} from "@careerfairy/shared-lib/dist/livestreams"
import { sxStyles } from "../../../../../types/commonTypes"
import { CurrentStreamContextInterface } from "../../../../../context/stream/StreamContext"
import { dataLayerLivestreamEvent } from "../../../../../util/analyticsUtils"

const styles = sxStyles({
   sendIcon: {
      background: "white",
      color: "primary.main",
      borderRadius: "50%",
      fontSize: 15,
   },
   sendIconEmpty: {
      color: "grey",
   },
   sendBtn: {
      width: 30,
      height: 30,
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
      borderRadius: 1.5,
      "& .MuiInputBase-root": {
         paddingRight: "0 !important",
         borderRadius: 1.5,
      },
   },
   scrollToBottom: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      height: "calc(100vh - 66px)",
      "& > div": {
         padding: 1.4,
         overflowX: "hidden",
      },
   },
   chatContainer: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
   },
   chatContent: {
      display: "flex",
      flexDirection: "column",
      boxShadow: 10,
      zIndex: 9000,
      padding: 1.4,
      background: (theme) => theme.palette.background.paper,
   },
   chatTitle: {
      display: "flex",
      width: "100%",
      justifyContent: "center",
      fontSize: "1.2em",
      fontWeight: 500,
      textAlign: "center",
      margin: "5px 0 15px 0",
   },
})

type Props = {
   isStreamer: boolean
   livestream: LivestreamEvent
   selectedState: CurrentStreamContextInterface["selectedState"]
}
const ChatCategory = ({ isStreamer, livestream, selectedState }: Props) => {
   const firebase = useFirebaseService()
   const { authenticatedUser, userData } = useAuth()
   const streamRef = useStreamRef()

   const [newChatEntry, setNewChatEntry] = useState("")
   const [chatEntries, setChatEntries] = useState([])
   const [submitting, setSubmitting] = useState(false)
   const [currentEntry, setCurrentEntry] = useState<LivestreamChatEntry | null>(
      null
   )

   const isEmpty =
      !newChatEntry.trim() || (!userData && !livestream.test && !isStreamer)

   useEffect(() => {
      if (livestream.id) {
         const unsubscribe = firebase.listenToChatEntries(
            streamRef,
            MAX_STREAM_CHAT_ENTRIES,
            (querySnapshot) => {
               const newEntries = querySnapshot.docs
                  .map((doc) => ({ id: doc.id, ...doc.data() }))
                  .reverse()
               setChatEntries(newEntries)
            }
         )
         return () => unsubscribe()
      }
   }, [livestream.id])

   const getAuthorName = () => {
      if (isStreamer || livestream.test) return "Streamer"
      if (userData)
         return userData.firstName + " " + userData.lastName.charAt(0)
      return "anonymous"
   }

   const getAuthorEmail = () => {
      if (authenticatedUser.email) return authenticatedUser.email
      if (isStreamer || livestream.test) return "Streamer"
      return "anonymous"
   }

   function addNewChatEntry() {
      if (!newChatEntry.trim() || submitting) {
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
      console.log("-> newChatEntryObject", newChatEntryObject)

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

         dataLayerLivestreamEvent("livestream_chat_new_message", livestream)
      }
   }

   const handleClearCurrentEntry = () => {
      setCurrentEntry(null)
   }

   const handleSetCurrentEntry = useCallback((chatEntry) => {
      setCurrentEntry(chatEntry)
   }, [])

   const chatElements = chatEntries.map((chatEntry, index, entries) => (
      <ChatEntryContainer
         handleSetCurrentEntry={handleSetCurrentEntry}
         last={index === entries.length - 1}
         key={chatEntry?.id}
         chatEntry={chatEntry}
      />
   ))

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

   return (
      <Box sx={styles.chatContainer}>
         <Box
            component={CustomScrollToBottom}
            sx={styles.scrollToBottom}
            scrollItems={chatElements}
         />
         <Box sx={styles.chatContent}>
            <div>
               <TextField
                  variant="outlined"
                  fullWidth
                  autoFocus={selectedState === "chat"}
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
            </div>
         </Box>
         <EmotesModal
            chatEntry={currentEntry}
            onClose={handleClearCurrentEntry}
         />
      </Box>
   )
}

export default ChatCategory
