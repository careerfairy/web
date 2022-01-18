import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { withFirebase } from "context/firebase";
import { grey } from "@mui/material/colors";
import { IconButton, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import ChatEntryContainer from "./chat/ChatEntryContainer";
import CustomScrollToBottom from "../../../../util/CustomScrollToBottom";
import { useAuth } from "../../../../../HOCs/AuthProvider";
import EmotesModal from "./chat/EmotesModal";
import useStreamRef from "../../../../custom-hook/useStreamRef";

const useStyles = makeStyles((theme) => ({
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
   scrollToBottom: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      height: "calc(100vh - 66px)",
      "& div": {
         overflowX: "hidden",
      },
   },
   entriesWrapper: {
      padding: theme.spacing(1),
   },
   chatContainer: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
   },
   chatContent: {
      display: "flex",
      flexDirection: "column",
      boxShadow: theme.shadows[10],
      zIndex: 9000,
      padding: theme.spacing(1.4),
      background: theme.palette.background.paper,
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
}));

const ChatCategory = ({ isStreamer, livestream, selectedState, firebase }) => {
   const { authenticatedUser, userData } = useAuth();
   const [focused, setFocused] = useState(false);
   const streamRef = useStreamRef();

   const [newChatEntry, setNewChatEntry] = useState("");
   const [chatEntries, setChatEntries] = useState([]);
   const [submitting, setSubmitting] = useState(false);
   const [currentEntry, setCurrentEntry] = useState(null);

   const isEmpty =
      !newChatEntry.trim() || (!userData && !livestream.test && !isStreamer);
   const classes = useStyles({ isEmpty });

   useEffect(() => {
      if (livestream.id) {
         const unsubscribe = firebase.listenToChatEntries(
            streamRef,
            150,
            (querySnapshot) => {
               const newEntries = querySnapshot.docs
                  .map((doc) => ({ id: doc.id, ...doc.data() }))
                  .reverse();
               setChatEntries(newEntries);
            }
         );
         return () => unsubscribe();
      }
   }, [livestream.id]);

   function addNewChatEntry() {
      if (!newChatEntry.trim() || submitting) {
         return;
      }
      setSubmitting(true);

      const newChatEntryObject = {
         message: newChatEntry,
         authorName:
            isStreamer || livestream.test
               ? "Streamer"
               : userData.firstName + " " + userData.lastName.charAt(0),
         authorEmail:
            isStreamer || livestream.test
               ? "Streamer"
               : authenticatedUser.email,
         votes: 0,
      };

      firebase.putChatEntry(streamRef, newChatEntryObject).then(
         () => {
            setSubmitting(false);
            setNewChatEntry("");
         },
         (error) => {
            setSubmitting(false);
            console.log("Error: " + error);
         }
      );
   }

   function addNewChatEntryOnEnter(target) {
      if (target.charCode == 13) {
         addNewChatEntry();
      }
   }

   const handleClearCurrentEntry = () => {
      setCurrentEntry(null);
   };

   const handleSetCurrentEntry = useCallback((chatEntry) => {
      setCurrentEntry(chatEntry);
   }, []);

   const chatElements = chatEntries.map((chatEntry) => (
      <ChatEntryContainer
         handleSetCurrentEntry={handleSetCurrentEntry}
         currentEntry={currentEntry}
         key={chatEntry?.id}
         chatEntry={chatEntry}
      />
   ));

   const playIcon = (
      <div>
         <IconButton
            classes={{
               root: classes.sendBtn,
               disabled: classes.buttonDisabled,
            }}
            disabled={isEmpty}
            onClick={() => addNewChatEntry()}
            size="large">
            <ChevronRightRoundedIcon className={classes.sendIcon} />
         </IconButton>
      </div>
   );

   return (
      <div className={classes.chatContainer}>
         <CustomScrollToBottom
            scrollViewClassName={classes.entriesWrapper}
            className={classes.scrollToBottom}
            scrollItems={chatElements}
         />
         <div className={classes.chatContent}>
            {/*<div className={classes.chatTitle}>*/}
            {/*    <ForumOutlinedIcon color="primary" fontSize="small"/>*/}
            {/*    <Typography style={{marginLeft: "0.6rem"}}>*/}
            {/*        Main Chat*/}
            {/*    </Typography>*/}
            {/*</div>*/}
            <div>
               <TextField
                  variant="outlined"
                  fullWidth
                  autoFocus={selectedState === "chat"}
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
            </div>
         </div>
         <EmotesModal
            chatEntry={currentEntry}
            onClose={handleClearCurrentEntry}
         />
      </div>
   );
};

ChatCategory.propTypes = {
   firebase: PropTypes.object,
   isStreamer: PropTypes.bool,
   livestream: PropTypes.object.isRequired,
   selectedState: PropTypes.string,
};

export default withFirebase(ChatCategory);
