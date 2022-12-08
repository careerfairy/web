import React, {
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined"
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded"
import {
   Accordion,
   AccordionDetails,
   AccordionSummary,
   Badge,
   IconButton,
   Tooltip,
   Typography,
} from "@mui/material"
import TutorialContext from "../../../../../context/tutorials/TutorialContext"
import {
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "../../../../../materialUI/GlobalTooltips"
import { dataLayerEvent } from "../../../../../util/analyticsUtils"
import { sxStyles } from "../../../../../types/commonTypes"
import ChatWidget from "./ChatWidget"
import Box from "@mui/material/Box"
import ConfirmDeleteModal from "../../modal/ConfirmDeleteModal"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import useStreamRef from "../../../../custom-hook/useStreamRef"
import { errorLogAndNotify } from "../../../../../util/CommonUtil"
import { useCurrentStream } from "../../../../../context/stream/StreamContext"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep"

const styles = sxStyles({
   accordionRoot: {
      boxShadow: 3,
      background: "background.paper",
   },
   accordionLeft: {
      display: "flex",
   },
   header: {
      height: "45px !important",
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
   chatRoom: {
      display: "flex",
      flexDirection: "column",
      padding: 0,
   },
   clearAllButton: {
      px: 1,
      py: 0.5,
      marginLeft: "auto",
   },
})

type Props = {
   className: string
   mobile?: boolean
}
const MiniChatContainer = ({ className, mobile = false }: Props) => {
   const firebase = useFirebaseService()
   const streamRef = useStreamRef()

   const { isStreamer, currentLivestream, presenter } = useCurrentStream()
   const { tutorialSteps, handleConfirmStep } = useContext(TutorialContext)
   const { adminGroups, userData } = useAuth()

   const [deleteChatsDialogOpen, setDeleteChatsDialogOpen] = useState(false)
   const [numberOfMissedEntries, setNumberOfMissedEntries] = useState(0)
   const [deletingAllMessages, setDeletingAllMessages] = useState(false)
   const [open, setOpen] = useState(false)

   const canDeleteAllChats = useMemo(
      () =>
         Boolean(
            isStreamer ||
               presenter.isStreamAdmin(adminGroups) ||
               userData?.isAdmin
         ),
      [isStreamer, presenter, adminGroups, userData]
   )

   const isOpen = (property) => {
      return Boolean(
         currentLivestream.test &&
            tutorialSteps.streamerReady &&
            tutorialSteps[property]
      )
   }

   useEffect(() => {
      if (open) {
         setNumberOfMissedEntries(0)
      }
   }, [open])

   const onChatEntryAdded = () => {
      if (isOpen(15)) {
         handleConfirmStep(15)
         // close the chat after two seconds
         setTimeout(() => setOpen(false), 2000)
      }
   }

   const handleCloseDeleteChatsDialog = useCallback(() => {
      setDeleteChatsDialogOpen(false)
   }, [setDeleteChatsDialogOpen])

   const handleDeleteChats = useCallback(async () => {
      if (!canDeleteAllChats) return
      try {
         setDeletingAllMessages(true)
         await firebase.deleteAllChatEntries(streamRef)
         handleCloseDeleteChatsDialog()
      } catch (e) {
         errorLogAndNotify(e, {
            message: "Error deleting all chat entries",
         })
      }
      setDeletingAllMessages(false)
   }, [canDeleteAllChats, firebase, streamRef, handleCloseDeleteChatsDialog])

   const handleClickDeleteAllChats = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
         event.stopPropagation()
         setDeleteChatsDialogOpen(true)
      },
      [setDeleteChatsDialogOpen]
   )

   if (mobile) {
      return null
   }

   return (
      <>
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
                  >
                     <Box sx={styles.accordionLeft}>
                        <Badge
                           badgeContent={numberOfMissedEntries}
                           color="error"
                        >
                           <ForumOutlinedIcon fontSize="small" />
                        </Badge>
                        <Typography style={{ marginLeft: "0.6rem" }}>
                           Chat
                        </Typography>
                     </Box>
                     {canDeleteAllChats && (
                        <Box sx={styles.clearAllButton}>
                           <Tooltip arrow title={"Clear all chat messages"}>
                              <IconButton
                                 size={"small"}
                                 onClick={handleClickDeleteAllChats}
                              >
                                 <DeleteSweepIcon />
                              </IconButton>
                           </Tooltip>
                        </Box>
                     )}
                  </AccordionSummary>
                  <AccordionDetails sx={styles.chatRoom}>
                     <ChatWidget
                        setNumberOfMissedEntries={setNumberOfMissedEntries}
                        onChatEntryAdded={onChatEntryAdded}
                        notVisible={!open}
                     />
                  </AccordionDetails>
               </Accordion>
            </WhiteTooltip>
         </div>
         {deleteChatsDialogOpen && canDeleteAllChats && (
            <ConfirmDeleteModal
               description={
                  "Are you sure you want to delete all messages? This action cannot be undone."
               }
               title={"Delete all messages"}
               loading={deletingAllMessages}
               onClose={handleCloseDeleteChatsDialog}
               onConfirm={handleDeleteChats}
            />
         )}
      </>
   )
}

export default MiniChatContainer
