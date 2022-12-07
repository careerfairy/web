import React, { memo, useEffect, useState } from "react"
import { Box, Card, IconButton, Popover, Typography } from "@mui/material"
import { getTimeFromNow } from "../../../../../helperFunctions/HelperFunctions"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined"
import EmotesPreview from "./EmotesPreview"
import EmotesPopUp from "./EmotesPopUp"
import Fade from "@stahl.luke/react-reveal/Fade"
import isEqual from "react-fast-compare"
import LinkifyText from "../../../../../util/LinkifyText"
import { LivestreamChatEntry } from "@careerfairy/shared-lib/dist/livestreams"
import { sxStyles } from "../../../../../../types/commonTypes"

const dayjs = require("dayjs")
const relativeTime = require("dayjs/plugin/relativeTime")
dayjs.extend(relativeTime)

const styles = sxStyles({
   emotesMenuButton: {
      position: "absolute",
      top: "50%",
      // right: ({ isMe }) => !isMe && "-30px",
      // left: ({ isMe }) => isMe && "-30px",
      right: "-30px",
      transform: "translateY(-50%)",
      opacity: 0.3,
   },
   emotesMenuButtonMe: {
      right: 0,
      left: "unset",
   },
   chatWrapper: {
      marginBottom: 1.4,
      maxWidth: "80%",
      width: "min-content",
      display: "flex",
      position: "relative",
   },
   chatWrapperMe: {
      marginLeft: "auto",
   },
   chatWrapperLast: {
      marginBottom: 0,
   },
   emotesPaperWrapper: {
      display: "flex",
      alignItems: "center",
      zChatEntryContainer: 1,
      padding: 1,
      "&  > *": {
         marginRight: 0.5,
      },
      overflow: "hidden",
      borderRadius: 2,
   },
   chatBubble: {
      borderRadius: "23px 23px 23px 5px",
      width: "max-content",
      minWidth: 140,
      padding: "8px 13px",
      paddingBottom: 0.6,
      backgroundColor: "background.paper",
      color: "inherit",
      overflowWrap: "break-word",
   },
   chatBubbleStreamer: {
      backgroundColor: "#ff1493",
   },
   chatBubbleMe: {
      borderRadius: "23px 23px 5px 23px",
      backgroundColor: "primary.main",
   },
   chatBubbleBroadcaster: {
      backgroundColor: (theme) => `${theme.palette.warning.main} !important`,
   },
   textWhite: {
      color: "white",
   },
   broadcast: {
      color: (theme) => `${theme.palette.common.white} !important`,
   },
   author: {
      fontSize: "0.8em",
      color: "rgb(180,180,180)",
      overflowWrap: "break-word",
      whiteSpace: "nowrap",
   },

   stamp: {
      fontSize: "0.7em",
      marginBottom: 0,
      color: "rgb(180,180,180)",
   },
})

type Props = {
   chatEntry: LivestreamChatEntry
   handleSetCurrentEntry: (entry: LivestreamChatEntry) => void
   last: boolean
}
const ChatEntryContainer = ({
   chatEntry,
   handleSetCurrentEntry,
   last,
}: Props) => {
   const firebase = useFirebaseService()
   const isNew = chatEntry.timestamp === null
   const [anchorEl, setAnchorEl] = useState(null)
   const { authenticatedUser } = useAuth()

   const [time, setTime] = useState(getTimeFromNow(chatEntry.timestamp))

   const [isMe, setIsMe] = useState(
      chatEntry?.authorEmail === authenticatedUser?.email
   )
   const [isStreamer, setIsStreamer] = useState(
      chatEntry?.authorEmail === "Streamer" || chatEntry.type === "streamer"
   )
   console.log("-> chatEntry.type", chatEntry.type)

   const hasTimestamp = Boolean(chatEntry.timestamp)

   useEffect(() => {
      setTime(getTimeFromNow(chatEntry.timestamp))
      const interval = setInterval(() => {
         setTime(getTimeFromNow(chatEntry.timestamp))
      }, 60000)
      return () => clearInterval(interval)
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [hasTimestamp])

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
         <Box
            component={"span"}
            sx={[
               styles.chatWrapper,
               isMe && styles.chatWrapperMe,
               last && styles.chatWrapperLast,
            ]}
         >
            <Popover
               id="mouse-over-popover"
               elevation={20}
               PaperProps={{
                  sx: styles.emotesPaperWrapper,
               }}
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
               sx={[
                  styles.chatBubble,
                  isStreamer && styles.chatBubbleStreamer,
                  isMe && styles.chatBubbleMe,
                  chatEntry.type === "broadcast" &&
                     styles.chatBubbleBroadcaster,
                  isMe || isStreamer || chatEntry.type === "broadcast"
                     ? styles.textWhite
                     : null,
               ]}
            >
               <LinkifyText>{chatEntry.message}</LinkifyText>
               <Typography
                  sx={[styles.author, (isMe || isStreamer) && styles.textWhite]}
               >
                  {chatEntry.authorName}
               </Typography>
               <Typography
                  align="right"
                  sx={[styles.stamp, (isMe || isStreamer) && styles.textWhite]}
               >
                  {time || "..."}
               </Typography>
            </Box>
            <IconButton
               size="small"
               sx={[styles.emotesMenuButton, isMe && styles.emotesMenuButtonMe]}
               onClick={handleOpenEmotesMenu}
            >
               <EmojiEmotionsOutlinedIcon />
            </IconButton>
            <EmotesPreview onClick={handleClickPreview} chatEntry={chatEntry} />
         </Box>
      </Fade>
   )
}

export default memo(ChatEntryContainer, isEqual)
