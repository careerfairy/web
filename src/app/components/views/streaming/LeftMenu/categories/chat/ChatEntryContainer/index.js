import PropTypes from "prop-types";
import React, { memo, useEffect, useState } from "react";
import Linkify from "react-linkify";
import makeStyles from '@mui/styles/makeStyles';
import {
   Box,
   Card,
   IconButton,
   Popover,
   Slide,
   Typography,
} from "@mui/material";
import { getTimeFromNow } from "../../../../../../helperFunctions/HelperFunctions";
import { useAuth } from "../../../../../../../HOCs/AuthProvider";
import { withFirebase } from "context/firebase";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import EmotesPreview from "./EmotesPreview";
import EmotesPopUp from "./EmotesPopUp";
import clsx from "clsx";

const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

const useStyles = makeStyles((theme) => ({
   emotesMenuButton: {
      position: "absolute",
      top: "50%",
      right: ({ isMe }) => !isMe && "-30px",
      left: ({ isMe }) => isMe && "-30px",
      transform: "translateY(-50%)",
      opacity: 0.3,
   },
   chatWrapper: {
      marginLeft: ({ isMe }) => (isMe ? "auto" : 0),
      marginBottom: theme.spacing(1),
      maxWidth: "80%",
      width: "min-content",
      display: "flex",
      position: "relative",
   },

   emotesPaperWrapper: {
      display: "flex",
      alignItems: "center",
      zChatEntryContainer: 1,
      padding: theme.spacing(1),
      "&  > *": {
         marginRight: theme.spacing(0.5),
      },
      overflow: "hidden",
      borderRadius: theme.spacing(2),
   },
   chatBubble: {
      borderRadius: ({ isMe }) =>
         isMe ? "23px 23px 5px 23px" : "23px 23px 23px 5px",
      width: "max-content",
      minWidth: 140,
      padding: "10px 15px",
      paddingBottom: 5,
      backgroundColor: ({ isMe, isStreamer }) =>
         isMe
            ? theme.palette.primary.main
            : isStreamer
            ? "#ff1493"
            : theme.palette.background.paper,
      color: ({ isMe, isStreamer }) =>
         isMe || isStreamer ? "white" : "inherit",
      overflowWrap: "break-word",
   },
   broadcast: {
      backgroundColor: `${theme.palette.warning.main} !important`,
      color: `${theme.palette.common.white} !important`,
   },
   author: {
      fontSize: "0.8em",
      color: ({ isMe, isStreamer }) =>
         isMe || isStreamer ? "white" : "rgb(180,180,180)",
      overflowWrap: "break-word",
      whiteSpace: "nowrap",
   },
   stamp: {
      fontSize: "0.7em",
      marginBottom: 0,
      color: ({ isMe, isStreamer }) =>
         isMe || isStreamer ? "white" : "rgb(180,180,180)",
   },
}));

function ChatEntryContainer({
   chatEntry,
   firebase,
   handleSetCurrentEntry,
   currentEntry,
}) {
   const [anchorEl, setAnchorEl] = useState(null);
   const { authenticatedUser } = useAuth();
   const [isMe, setIsMe] = useState(
      chatEntry?.authorEmail === authenticatedUser?.email
   );
   const [isStreamer, setIsStreamer] = useState(
      chatEntry?.authorEmail === "Streamer"
   );

   const classes = useStyles({
      isMe,
      isStreamer,
   });

   useEffect(() => {
      setIsMe(chatEntry?.authorEmail === authenticatedUser?.email);
   }, [chatEntry?.authorEmail, authenticatedUser?.email]);

   useEffect(() => {
      setIsStreamer(chatEntry?.authorEmail === "Streamer");
   }, [chatEntry?.authorEmail]);

   const handleOpenEmotesMenu = (event) => {
      setAnchorEl(event.currentTarget);
   };
   const handleCloseEmotesMenu = () => {
      setAnchorEl(null);
   };

   const handleClickPreview = () => handleSetCurrentEntry(chatEntry);

   const componentDecorator = (href, text, key) => (
      <a href={href} key={key} target="_blank">
         {text}
      </a>
   );

   const open = Boolean(anchorEl);
   return (
      <Slide in direction={isMe ? "left" : "right"}>
         <span className={classes.chatWrapper}>
            <Popover
               id="mouse-over-popover"
               elevation={20}
               classes={{
                  paper: classes.emotesPaperWrapper,
               }}
               PaperProps={{}}
               open={open}
               anchorEl={anchorEl}
               anchorOrigin={{
                  vertical: "top",
                  horizontal: "center",
               }}
               transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
               }}
               onClose={handleCloseEmotesMenu}
            >
               <EmotesPopUp
                  chatEntry={chatEntry}
                  firebase={firebase}
                  handleCloseEmotesMenu={handleCloseEmotesMenu}
               />
            </Popover>
            <Box
               component={Card}
               className={clsx(classes.chatBubble, {
                  [classes.broadcast]: chatEntry.type === "broadcast",
               })}
            >
               <Linkify componentDecorator={componentDecorator}>
                  {chatEntry.message}
               </Linkify>
               <Typography className={classes.author}>
                  {chatEntry.authorName}
               </Typography>
               <Typography align="right" className={classes.stamp}>
                  {getTimeFromNow(chatEntry.timestamp)}
               </Typography>
            </Box>
            <IconButton
               size="small"
               className={classes.emotesMenuButton}
               onClick={handleOpenEmotesMenu}
            >
               <EmojiEmotionsOutlinedIcon />
            </IconButton>
            <EmotesPreview onClick={handleClickPreview} chatEntry={chatEntry} />
         </span>
      </Slide>
   );
}

ChatEntryContainer.propTypes = {
   chatEntry: PropTypes.object.isRequired,
   currentEntry: PropTypes.object,
   firebase: PropTypes.object,
   handleSetCurrentEntry: PropTypes.func.isRequired,
};

export default withFirebase(memo(ChatEntryContainer));
