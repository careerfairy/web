import React, { useContext, useEffect, useState } from "react"
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined"
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded"
import {
   Accordion,
   AccordionDetails,
   AccordionSummary,
   Badge,
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
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { sxStyles } from "../../../../../types/commonTypes"
import ChatWidget from "./ChatWidget"

const styles = sxStyles({
   accordionRoot: {
      boxShadow: 3,
      background: "background.paper",
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
   chatRoom: {
      display: "flex",
      flexDirection: "column",
      padding: 0,
   },
})

type Props = {
   livestream: LivestreamEvent
   className: string
   mobile?: boolean
}
const MiniChatContainer = ({
   livestream,
   className,
   mobile = false,
}: Props) => {
   const { tutorialSteps, handleConfirmStep } = useContext(TutorialContext)
   const [numberOfMissedEntries, setNumberOfMissedEntries] = useState(0)

   const [open, setOpen] = useState(false)

   const isOpen = (property) => {
      return Boolean(
         livestream.test &&
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

   if (mobile) {
      return null
   }

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
                  <Badge badgeContent={numberOfMissedEntries} color="error">
                     <ForumOutlinedIcon fontSize="small" />
                  </Badge>
                  <Typography style={{ marginLeft: "0.6rem" }}>Chat</Typography>
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
   )
}

export default MiniChatContainer
