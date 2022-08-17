import PropTypes from "prop-types"
import React, { memo, useEffect, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Box, Card, IconButton, Popover, Typography } from "@mui/material"
import { getTimeFromNow } from "../../../../../../helperFunctions/HelperFunctions"
import { useAuth } from "../../../../../../../HOCs/AuthProvider"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined"
import EmotesPreview from "./EmotesPreview"
import EmotesPopUp from "./EmotesPopUp"
import Fade from "@stahl.luke/react-reveal/Fade"
import isEqual from "react-fast-compare"

import clsx from "clsx"
import LinkifyText from "../../../../../../util/LinkifyText"

const dayjs = require("dayjs")
const relativeTime = require("dayjs/plugin/relativeTime")
dayjs.extend(relativeTime)

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
      marginBottom: ({ last }) => !last && theme.spacing(1.4),
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
      padding: "8px 13px",
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
}))

const ChatEntryContainer = ({
   chatEntry,
   handleSetCurrentEntry,
   currentEntry,
   last,
}) => {
   const firebase = useFirebaseService()
   const isNew = chatEntry.timestamp === null
   const [anchorEl, setAnchorEl] = useState(null)
   const { authenticatedUser } = useAuth()

   const [time, setTime] = useState(getTimeFromNow(chatEntry.timestamp))

   const [isMe, setIsMe] = useState(
      chatEntry?.authorEmail === authenticatedUser?.email
   )
   const [isStreamer, setIsStreamer] = useState(
      chatEntry?.authorEmail === "Streamer"
   )

   const classes = useStyles({
      isMe,
      isStreamer,
      last,
   })

   useEffect(() => {
      setTime(getTimeFromNow(chatEntry.timestamp))
      const interval = setInterval(() => {
         setTime(getTimeFromNow(chatEntry.timestamp))
      }, 60000)
      return () => clearInterval(interval)
   }, [Boolean(chatEntry.timestamp)])

   useEffect(() => {
      setIsMe(chatEntry?.authorEmail === authenticatedUser?.email)
   }, [chatEntry?.authorEmail, authenticatedUser?.email])

   useEffect(() => {
      setIsStreamer(chatEntry?.authorEmail === "Streamer")
   }, [chatEntry?.authorEmail])

   const handleOpenEmotesMenu = (event) => {
      setAnchorEl(event.currentTarget)
   }
   const handleCloseEmotesMenu = () => {
      setAnchorEl(null)
   }

   const handleClickPreview = () => handleSetCurrentEntry(chatEntry)

   const open = Boolean(anchorEl)
   return (
      <Fade left={!isMe && isNew} right={isMe && isNew} duration={250}>
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
               <LinkifyText>{chatEntry.message}</LinkifyText>
               <Typography className={classes.author}>
                  {chatEntry.authorName}
               </Typography>
               <Typography align="right" className={classes.stamp}>
                  {time || "..."}
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
      </Fade>
   )
}

ChatEntryContainer.propTypes = {
   chatEntry: PropTypes.object.isRequired,
   currentEntry: PropTypes.object,
   firebase: PropTypes.object,
   handleSetCurrentEntry: PropTypes.func.isRequired,
}

// function areEqual(prevProps, nextProps) {
//    /*
//    return true if passing nextProps to render would return
//    the same result as passing prevProps to render,
//    otherwise return false
//    */
//    return Boolean(
//       prevProps.chatEntry?.message === nextProps.chatEntry?.message &&
//          prevProps.chatEntry?.heart?.length ===
//             nextProps.chatEntry?.heart?.length &&
//          prevProps.chatEntry?.laughing?.length ===
//             nextProps.chatEntry?.laughing?.length &&
//          prevProps.chatEntry?.thumbsUp?.length ===
//             nextProps.chatEntry?.thumbsUp?.length &&
//          prevProps.chatEntry?.wow?.length ===
//             nextProps.chatEntry?.wow?.length &&
//          Boolean(prevProps.chatEntry?.timestamp) ===
//             Boolean(nextProps.chatEntry?.timestamp) &&
//          prevProps.last === nextProps.last
//    );
// }

export default memo(ChatEntryContainer, isEqual)
