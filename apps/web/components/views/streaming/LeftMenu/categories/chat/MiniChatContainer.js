import React, { useCallback, useContext, useEffect, useState } from "react"
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined"
import {
   useFirebaseService,
   withFirebase,
} from "context/firebase/FirebaseServiceContext"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import ChatEntryContainer from "./ChatEntryContainer"
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded"
import {
   Accordion,
   AccordionDetails,
   AccordionSummary,
   Badge,
   Button,
   Collapse,
   IconButton,
   TextField,
   Typography,
} from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
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

const useStyles = makeStyles((theme) => ({
   root: {},
   accordionRoot: {
      boxShadow: theme.shadows[3],
      background: theme.palette.background.paper,
   },
   sendIcon: {
      background: "white",
      color: ({ isEmpty }) => (isEmpty ? "grey" : theme.palette.primary.main),
      borderRadius: "50%",
      fontSize: 15,
   },
   sendBtn: {
      width: 30,
      height: 30,
      background: alpha(theme.palette.primary.main, 0.5),
      "&$buttonDisabled": {
         color: grey[800],
      },
      "&:hover": {
         backgroundColor: theme.palette.primary.main,
      },
      margin: "0.5rem",
   },
   buttonDisabled: {},
   chatInput: {
      borderRadius: 10,
      "& .MuiInputBase-root": {
         paddingRight: "0 !important",
         borderRadius: 10,
      },
   },
   header: {
      height: "41px !important",
      padding: "10px 15px",
      "& .MuiAccordionSummary-content": {
         margin: 0,
         display: "flex",
         alignItems: "center",
      },
   },
   expanded: {
      minHeight: "41px !important",
   },
   chatRoom: {
      display: "flex",
      flexDirection: "column",
      padding: 0,
   },
   scrollToBottom: {
      backgroundColor: theme.palette.background.default,
      height: "240px",
      "& div": {
         overflowX: "hidden",
      },
   },
   entriesWrapper: {
      padding: theme.spacing(1.4),
   },
}))

const now = new Date()

function MiniChatContainer({ isStreamer, livestream, className, mobile }) {
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
   const classes = useStyles({ isEmpty })

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
      if (isStreamer || livestream.test) return "Streamer"
      else if (livestream.openStream) return "anonymous"
      else if (userData) {
         return userData.firstName + " " + userData.lastName.charAt(0)
      }
   }

   const getAuthorEmail = () => {
      if (isStreamer || livestream.test) return "Streamer"
      else if (livestream.openStream) return "anonymous"
      else if (authenticatedUser) {
         return authenticatedUser.email
      }
   }

   function addNewChatEntry() {
      if (isEmpty || submitting) {
         return
      }
      setSubmitting(true)

      const newChatEntryObject = {
         message: newChatEntry,
         authorName: getAuthorName(),
         authorEmail: getAuthorEmail(),
         votes: 0,
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

   function addNewChatEntryOnEnter(target) {
      if (target.charCode == 13) {
         addNewChatEntry()
         if (isOpen(15)) {
            handleConfirmStep(15)
            // close the chat after two seconds
            setTimeout(() => setOpen(false), 2000)
         }
      }
   }

   if (mobile) {
      return null
   }

   const playIcon = (
      <div>
         <IconButton
            classes={{
               root: classes.sendBtn,
               disabled: classes.buttonDisabled,
            }}
            disabled={isEmpty}
            onClick={() => addNewChatEntry()}
            size="large"
         >
            <ChevronRightRoundedIcon className={classes.sendIcon} />
         </IconButton>
      </div>
   )

   return (
      <div className={clsx(classes.root, className)}>
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
               }}
               className={classes.accordionRoot}
               expanded={open}
            >
               <AccordionSummary
                  className={classes.header}
                  expandIcon={<ExpandLessRoundedIcon />}
                  aria-controls="chat-header"
                  id="chat-header"
                  classes={{ expanded: classes.expanded }}
               >
                  <Badge badgeContent={numberOfMissedEntries} color="error">
                     <ForumOutlinedIcon fontSize="small" />
                  </Badge>
                  <Typography style={{ marginLeft: "0.6rem" }}>Chat</Typography>
               </AccordionSummary>
               <AccordionDetails className={classes.chatRoom}>
                  <CustomScrollToBottom
                     scrollViewClassName={classes.entriesWrapper}
                     className={classes.scrollToBottom}
                     scrollItems={chatEntries.map(
                        (chatEntry, index, entries) => (
                           <ChatEntryContainer
                              handleSetCurrentEntry={handleSetCurrentEntry}
                              last={index === entries.length - 1}
                              currentEntry={currentEntry}
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
                           className={classes.chatInput}
                           size="small"
                           onKeyPress={addNewChatEntryOnEnter}
                           value={newChatEntry}
                           onChange={() => setNewChatEntry(event.target.value)}
                           placeholder="Post in the chat..."
                           InputProps={{
                              maxLength: 340,
                              endAdornment: playIcon,
                           }}
                        />
                        {!livestream?.questionsDisabled && (
                           <Collapse
                              align="center"
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

export default withFirebase(MiniChatContainer)
