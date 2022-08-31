import React, { useEffect, useState } from "react"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import {
   Box,
   Button,
   Checkbox,
   CircularProgress,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   FormControlLabel,
} from "@mui/material"
import { GlassDialog } from "materialUI/GlobalModals"
import { v4 as uuid } from "uuid"
import useStreamRef from "../../../custom-hook/useStreamRef"
import { useLocalStorage } from "react-use"

type Props = {
   open: boolean
   handleClose: (wantsDemo: boolean) => void
   smallScreen: boolean
}

const DemoIntroModal = ({ open, handleClose, smallScreen }: Props) => {
   const firebase = useFirebaseService()
   const [loading, setLoading] = useState(false)
   const streamRef = useStreamRef()
   const [_, setHasDismissedStreamTutorial] = useLocalStorage(
      "hasDismissedStreamTutorial",
      false
   )

   const [dismissTutorial, setDismissTutorial] = useState(false)

   useEffect(() => {
      if (smallScreen) {
         setHasDismissedStreamTutorial(true)
         handleClose(false)
      }
   }, [smallScreen])

   const createTestLivestream = async () => {
      const testChatEntries = [
         {
            authorEmail: "john@ethz.ch",
            authorName: "John C",
            message: "Hello!",
            timestamp: firebase.getFirebaseTimestamp("March 17, 2020 03:24:00"),
         },
         {
            authorEmail: "marco@ethz.ch",
            authorName: "Marco D",
            message: "Thank you for having us!",
            timestamp: firebase.getFirebaseTimestamp("March 17, 2020 03:34:00"),
         },
         {
            authorEmail: "david@ethz.ch",
            authorName: "David P",
            message: "Hi there!",
            timestamp: firebase.getFirebaseTimestamp("March 17, 2020 03:44:00"),
         },
      ]
      const testQuestionsEntries = [
         {
            author: "john@ethz.ch",
            type: "new",
            title: "What is your interview process like?",
            timestamp: firebase.getFirebaseTimestamp("March 17, 2020 03:24:00"),
            votes: 24,
         },
         {
            author: "john@ethz.ch",
            type: "new",
            title: "How has the company changed due to COVID?",
            timestamp: firebase.getFirebaseTimestamp("March 17, 2020 03:34:00"),
            votes: 20,
         },
      ]
      const testPolls = [
         {
            question: "What should we discuss next?",
            state: "upcoming",
            options: [
               {
                  id: uuid(),
                  text: "Our next product",
               },
               {
                  id: uuid(),
                  text: "What our internships look like",
               },
               {
                  id: uuid(),
                  text: "Our personal story",
               },
            ],
            timestamp: firebase.getFirebaseTimestamp("March 17, 2020 03:24:00"),
         },
      ]
      try {
         setLoading(true)
         await firebase.resetTestStream(
            streamRef,
            testChatEntries,
            testQuestionsEntries,
            testPolls
         )
         handleClose(true) // handleClose should trigger some emotes
      } catch (e) {
         console.log(e)
      }
   }

   const handleStartDemo = async () => {
      setHasDismissedStreamTutorial(dismissTutorial)
      await createTestLivestream()
   }

   return (
      <GlassDialog open={open}>
         <DialogTitle>Welcome to the Testing platform</DialogTitle>
         <DialogContent>
            <DialogContentText>
               Would you like to partake in the tutorial?
               <Box sx={{ pt: 1 }}>
                  <FormControlLabel
                     control={
                        <Checkbox
                           checked={dismissTutorial}
                           onChange={(event) => {
                              setDismissTutorial(event.target.checked)
                           }}
                           name="stream-tutorial-prompt-dismiss"
                        />
                     }
                     label="Don't prompt me again."
                  />
               </Box>
            </DialogContentText>
         </DialogContent>

         <DialogActions>
            <Button
               onClick={handleStartDemo}
               startIcon={
                  loading && <CircularProgress size={20} color="inherit" />
               }
               disabled={loading}
               variant="contained"
               color="primary"
            >
               Yes Please
            </Button>
            <Button
               onClick={() => {
                  setHasDismissedStreamTutorial(dismissTutorial)
                  handleClose(false)
               }}
               color="grey"
               disabled={loading}
            >
               No Thanks
            </Button>
         </DialogActions>
      </GlassDialog>
   )
}

export default DemoIntroModal
