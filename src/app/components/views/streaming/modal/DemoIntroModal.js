import React, { useState } from "react";
import { useFirebase } from "context/firebase";
import {
   Button,
   CircularProgress,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
} from "@material-ui/core";
import { GlassDialog } from "materialUI/GlobalModals";
import { v4 as uuid } from "uuid";
import useStreamRef from "../../../custom-hook/useStreamRef";

const DemoIntroModal = ({ open, handleClose }) => {
   const firebase = useFirebase();
   const [loading, setLoading] = useState(false);
   const streamRef = useStreamRef();

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
      ];
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
      ];
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
      ];
      try {
         setLoading(true);
         await firebase.resetTestStream(
            streamRef,
            testChatEntries,
            testQuestionsEntries,
            testPolls
         );
         handleClose(true); // handleClose should trigger some emotes
      } catch (e) {
         console.log(e);
      }
   };

   const handleStartDemo = async () => {
      await createTestLivestream();
   };

   return (
      <GlassDialog open={open}>
         <DialogTitle>Welcome to the Testing platform</DialogTitle>
         <DialogContent>
            <DialogContentText>
               Would you like to partake in the tutorial?
            </DialogContentText>
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
                  onClick={() => handleClose(false)}
                  disabled={loading}
                  variant="contained"
               >
                  No Thanks
               </Button>
            </DialogActions>
         </DialogContent>
      </GlassDialog>
   );
};

export default DemoIntroModal;
