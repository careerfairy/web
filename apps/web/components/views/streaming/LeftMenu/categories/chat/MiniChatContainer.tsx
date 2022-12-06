import React, {
   KeyboardEventHandler,
   useCallback,
   useContext,
   useEffect,
   useState,
} from "react"
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import ChatEntryContainer from "./ChatEntryContainer"
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded"
import {
   Accordion,
   AccordionDetails,
   AccordionSummary,
   Badge,
   Box,
   Button,
   Collapse,
   IconButton,
   TextField,
   Typography,
} from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import { grey } from "@mui/material/colors"
import TutorialContext from "../../../../../../context/tutorials/TutorialContext"
import {
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "../../../../../../materialUI/GlobalTooltips"
import CustomScrollToBottom from "../../../../../util/CustomScrollToBottom"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import clsx from "clsx"
import EmotesModal from "./EmotesModal"
import useStreamRef from "../../../../../custom-hook/useStreamRef"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"
import { MAX_STREAM_CHAT_ENTRIES } from "../../../../../../constants/streams"
import {
   dataLayerEvent,
   dataLayerLivestreamEvent,
} from "../../../../../../util/analyticsUtils"
import {
   LivestreamChatEntry,
   LivestreamEvent,
} from "@careerfairy/shared-lib/dist/livestreams"
import { sxStyles } from "../../../../../../types/commonTypes"

const styles = sxStyles({
   accordionRoot: {
      boxShadow: 3,
      background: "background.paper",
   },
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
      borderRadius: 10,
      "& .MuiInputBase-root": {
         paddingRight: "0 !important",
         borderRadius: 10,
      },
   },
   header: {
      height: "41px !important",
      minHeight: "41px !important",
      padding: "10px 15px",
      "& .MuiAccordionSummary-content": {
         margin: 0,
         display: "flex",
         alignItems: "center",
      },
      "& .Mui-expanded": {
         margin: 0,
      },
   },
   expanded: {},
   chatRoom: {
      display: "flex",
      flexDirection: "column",
      padding: 0,
   },
   scrollToBottom: {
      backgroundColor: "background.default",
      height: "240px",
      "& > div": {
         padding: 1.4,
         overflowX: "hidden",
      },
   },
})

const now = new Date()

type Props = {
   isStreamer: boolean
   livestream: LivestreamEvent
   className: string
   mobile?: boolean
}
const MiniChatContainer = ({
   isStreamer,
   livestream,
   className,
   mobile = false,
}) => {
   const { authenticatedUser, userData } = useAuth()
   const firebase = useFirebaseService()
   const dispatch = useDispatch()
   const theme = useTheme()
   const { tutorialSteps, setTutorialSteps, handleConfirmStep } =
      useContext(TutorialContext)
   const streamRef = useStreamRef()
   const [chatEntries, setChatEntries] = useState([])
   const [focused, setFocused] = useState(false)
   const [submitting, setSubmitting] = useState(false)
   const [currentEntry, setCurrentEntry] = useState(null)
   const [numberOfMissedEntries, setNumberOfMissedEntries] = useState(0)
   const [numberOfLatestChanges, setNumberOfLatestChanges] = useState(0)

   const [newChatEntry, setNewChatEntry] = useState("")
   const [open, setOpen] = useState(false)

   const isEmpty =
      !newChatEntry.trim() ||
      (!userData && !livestream.test && !livestream.openStream && !isStreamer)

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
               querySnapshot.docChanges().forEach((change) => {
                  let number = 0
                  if (change.type === "added") {
                     handleBroadcast(change)
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
   }, [livestream.id])

   useEffect(() => {
      if (numberOfMissedEntries + numberOfLatestChanges <= 100 && !open) {
         setNumberOfMissedEntries(numberOfMissedEntries + numberOfLatestChanges)
      }
      setNumberOfLatestChanges(0)
   }, [numberOfLatestChanges])

   useEffect(() => {
      if (open) {
         setNumberOfMissedEntries(0)
      }
   }, [open])

   useEffect(() => {
      if (tutorialSteps.streamerReady) {
         setNumberOfMissedEntries(3) // resets the missed entries back to 3
      }
   }, [tutorialSteps.streamerReady])

   const handleBroadcast = async (change) => {
      const entryData = change.doc.data()
      if (entryData.type === "broadcast") {
         const isNewBroadcast = entryData.timestamp?.toDate() > now
         if (isNewBroadcast) {
            const { authorName, message } = entryData
            const broadCastMessage = `${authorName} - ${message}`
            const handleCloseAction = () =>
               dispatch(actions.closeSnackbar(broadCastMessage))
            const action = (
               <Button
                  style={{ color: theme.palette.common.white }}
                  onClick={handleCloseAction}
               >
                  Dismiss
               </Button>
            )
            dispatch(actions.enqueueBroadcastMessage(broadCastMessage, action))
         }
      }
   }

   const isOpen = (property) => {
      return Boolean(
         livestream.test &&
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
      if (userData) {
         return userData.firstName + " " + userData.lastName.charAt(0)
      }
      if (isStreamer || livestream.test) return "Streamer"
      return "anonymous"
   }

   const getAuthorEmail = () => {
      if (authenticatedUser.email) return authenticatedUser.email
      if (isStreamer || livestream.test) return "Streamer"
      return "anonymous"
   }

   function addNewChatEntry() {
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
         if (isOpen(15)) {
            handleConfirmStep(15)
            // close the chat after two seconds
            setTimeout(() => setOpen(false), 2000)
         }
         dataLayerLivestreamEvent("livestream_chat_new_message", livestream)
      }
   }

   if (mobile) {
      return null
   }

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
      <div className={className}>
         <WhiteTooltip
            placement="top"
            title={
               <React.Fragment>
                  <TooltipTitle>Chat (1/2)</TooltipTitle>
                  <TooltipText>
                     Dont forget you can also interact with your audience
                     through the direct chat room
                  </TooltipText>
                  <TooltipButtonComponent
                     onConfirm={() => {
                        setOpen(true)
                        handleConfirmStep(14)
                     }}
                     buttonText="Ok"
                  />
               </React.Fragment>
            }
            open={isOpen(14)}
         >
            <Accordion
               TransitionProps={{ unmountOnExit: true }}
               onChange={() => {
                  !open && isOpen(14) && handleConfirmStep(14)
                  setOpen(!open)
                  if (!open) {
                     // chat is being opened
                     dataLayerEvent("livestream_chat_open")
                  }
               }}
               sx={styles.accordionRoot}
               expanded={open}
            >
               <AccordionSummary
                  sx={styles.header}
                  expandIcon={<ExpandLessRoundedIcon />}
                  aria-controls="chat-header"
                  id="chat-header"
                  // classes={{ expanded: classes.expanded }}
               >
                  <Badge badgeContent={numberOfMissedEntries} color="error">
                     <ForumOutlinedIcon fontSize="small" />
                  </Badge>
                  <Typography style={{ marginLeft: "0.6rem" }}>Chat</Typography>
               </AccordionSummary>
               <AccordionDetails sx={styles.chatRoom}>
                  <Box
                     component={CustomScrollToBottom}
                     sx={styles.scrollToBottom}
                     scrollItems={chatEntries.map(
                        (chatEntry, index, entries) => (
                           <ChatEntryContainer
                              handleSetCurrentEntry={handleSetCurrentEntry}
                              last={index === entries.length - 1}
                              key={chatEntry.id}
                              chatEntry={chatEntry}
                           />
                        )
                     )}
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
                     <div style={{ margin: 5 }}>
                        <TextField
                           variant="outlined"
                           fullWidth
                           autoFocus
                           onBlur={() => setFocused(false)}
                           onFocus={() => setFocused(true)}
                           sx={styles.chatInput}
                           size="small"
                           onKeyPress={addNewChatEntryOnEnter}
                           value={newChatEntry}
                           onChange={(event) =>
                              setNewChatEntry(event.target.value)
                           }
                           placeholder="Post in the chat..."
                           InputProps={{
                              // @ts-ignore
                              maxLength: 340,
                              endAdornment: playIcon,
                           }}
                        />
                        {!livestream?.questionsDisabled && (
                           <Collapse
                              // align="center"
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
                     </div>
                  </WhiteTooltip>
               </AccordionDetails>
            </Accordion>
         </WhiteTooltip>
         <EmotesModal
            chatEntry={currentEntry}
            onClose={handleClearCurrentEntry}
         />
      </div>
   )
}

export default MiniChatContainer
