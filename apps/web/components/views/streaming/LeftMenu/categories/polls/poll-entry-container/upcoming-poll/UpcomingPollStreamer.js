import React, { useContext, useEffect, useState } from "react"
import EditIcon from "@mui/icons-material/Edit"
import { withFirebase } from "context/firebase/FirebaseServiceContext"
import PollCreationModal from "../../poll-creation-modal/PollCreationModal"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import {
   Box,
   Button,
   IconButton,
   List,
   ListItem,
   ListItemIcon,
   ListItemText,
   Menu,
   MenuItem,
   Paper,
   Typography,
} from "@mui/material"
import CloseRounded from "@mui/icons-material/CloseRounded"
import { colorsArray } from "../../../../../../../util/colors"
import TutorialContext from "../../../../../../../../context/tutorials/TutorialContext"
import {
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "../../../../../../../../materialUI/GlobalTooltips"
import { styled } from "@mui/material/styles"

import useStreamRef from "../../../../../../../custom-hook/useStreamRef"

const Overlay = styled(Paper)(({ theme }) => ({
   borderRadius: theme.spacing(2),
   position: "absolute",
   height: "100%",
   top: 0,
   Bottom: 0,
   left: 0,
   right: 0,
   background: "rgba(100,100,100,0.85)",
   zIndex: 300,
   cursor: "pointer",
   display: "grid",
   placeItems: "center",
   "& div": {
      textAlign: "center",
      width: "70%",
      color: "white",
      fontSize: "1.2em",
   },
}))

const ListNumber = styled(Box)(({ theme }) => ({
   color: "white",
   borderRadius: "50%",
   width: 20,
   height: 20,
   display: "grid",
   placeItems: "center",
}))

function UpcomingPollStreamer({
   firebase,
   sliding,
   somePollIsCurrent,
   livestream,
   poll,
   showMenu,
   selectedState,
   index,
   setDemoPolls,
   addNewPoll,
}) {
   const streamRef = useStreamRef()
   const [editPoll, setEditPoll] = useState(false)
   const [showNotEditableMessage, setShowNotEditableMessage] = useState(false)

   const [anchorEl, setAnchorEl] = useState(null)
   const { tutorialSteps, setTutorialSteps, handleConfirmStep } =
      useContext(TutorialContext)

   useEffect(() => {}, [poll?.options])
   const isOpen = (property) => {
      return Boolean(
         livestream.test &&
            index === 0 &&
            showMenu &&
            tutorialSteps.streamerReady &&
            tutorialSteps[property] &&
            selectedState === "polls" &&
            !addNewPoll &&
            !sliding
      )
   }

   const isOtherOpen = (property) => {
      return Boolean(
         livestream.test &&
            showMenu &&
            tutorialSteps.streamerReady &&
            tutorialSteps[property] &&
            selectedState === "polls" &&
            !addNewPoll &&
            !sliding
      )
   }

   const tutorialActive = () => {
      return Boolean(isOtherOpen(4) || isOtherOpen(5))
   }

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget)
   }

   const handleClose = () => {
      setAnchorEl(null)
   }

   const handleOpenPollModal = () => {
      setEditPoll(true)
      handleClose()
   }

   function deletePoll() {
      firebase.deleteLivestreamPoll(streamRef, poll.id)
   }

   function setPollState(state) {
      firebase.setPollState(streamRef, poll.id, state)
   }

   function handleSetIsNotEditablePoll() {
      if (somePollIsCurrent) {
         setShowNotEditableMessage(true)
      }
   }

   const optionElements = poll?.options?.map(({ id, text }, index) => {
      return (
         <ListItem disableGutters dense key={id}>
            <ListItemIcon>
               <ListNumber style={{ backgroundColor: colorsArray[index] }}>
                  {index + 1}
               </ListNumber>
            </ListItemIcon>
            <ListItemText>{text}</ListItemText>
         </ListItem>
      )
   })

   return (
      <WhiteTooltip
         placement="right-start"
         title={
            <React.Fragment>
               <TooltipTitle>Polls (2/4)</TooltipTitle>
               <TooltipText>
                  All your created polls will be stored here
               </TooltipText>
               <TooltipButtonComponent
                  onConfirm={() => handleConfirmStep(5)}
                  buttonText="Ok"
               />
            </React.Fragment>
         }
         open={isOpen(5)}
      >
         <Paper
            sx={{
               borderRadius: (theme) => theme.spacing(2),
               margin: 1,
               position: "relative",
            }}
            onMouseEnter={handleSetIsNotEditablePoll}
            onMouseLeave={() => setShowNotEditableMessage(false)}
         >
            <Box p={2}>
               <Typography
                  gutterBottom
                  variant="h6"
                  style={{ margin: "1.5rem 0 0.5rem 0" }}
               >
                  {poll.question}
               </Typography>
               <List dense>{optionElements}</List>
               <IconButton
                  size="small"
                  onClick={handleClick}
                  style={{
                     position: "absolute",
                     top: 5,
                     right: 0,
                     color: "rgb(200,200,200)",
                     zIndex: 301,
                  }}
               >
                  <MoreVertIcon />
               </IconButton>
               <Menu
                  onClose={handleClose}
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
               >
                  <MenuItem dense onClick={handleOpenPollModal}>
                     <ListItemIcon>
                        <EditIcon />
                     </ListItemIcon>
                     <ListItemText primary="Edit" />
                  </MenuItem>
                  <MenuItem dense onClick={deletePoll}>
                     <ListItemIcon>
                        <CloseRounded />
                     </ListItemIcon>
                     <ListItemText primary="Delete" />
                  </MenuItem>
               </Menu>
            </Box>
            <WhiteTooltip
               placement="right-start"
               title={
                  <React.Fragment>
                     <TooltipTitle>Polls (3/4)</TooltipTitle>
                     <TooltipText>
                        Once you are ready, click here to ask the audience
                     </TooltipText>
                     <TooltipButtonComponent
                        onConfirm={() => {
                           setDemoPolls(true)
                           setPollState("current")
                           handleConfirmStep(6)
                        }}
                        buttonText="Ok"
                     />
                  </React.Fragment>
               }
               open={isOpen(6)}
            >
               <Button
                  fullWidth
                  disableElevation
                  variant="contained"
                  color="primary"
                  disabled={somePollIsCurrent || tutorialActive()}
                  sx={{
                     borderRadius: (theme) => theme.spacing(0, 0, 2, 2),
                  }}
                  onClick={() => {
                     if (isOpen(6)) {
                        handleConfirmStep(6)
                        setDemoPolls(true)
                     }
                     setPollState("current")
                  }}
               >
                  Ask the Audience Now
               </Button>
            </WhiteTooltip>
            {showNotEditableMessage && (
               <Overlay>
                  <div>
                     Please close the active poll before activating this one.
                  </div>
               </Overlay>
            )}
            <PollCreationModal
               initialPoll={poll}
               open={editPoll}
               handleClose={() => setEditPoll(false)}
            />
         </Paper>
      </WhiteTooltip>
   )
}

export default withFirebase(UpcomingPollStreamer)
