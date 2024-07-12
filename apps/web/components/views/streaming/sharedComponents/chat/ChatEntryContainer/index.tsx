import { LivestreamChatEntry } from "@careerfairy/shared-lib/livestreams"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined"
import { Box, Card, IconButton, Popover, Typography } from "@mui/material"
import Fade from "@stahl.luke/react-reveal/Fade"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import React, { memo, useCallback, useEffect, useState } from "react"
import isEqual from "react-fast-compare"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../../../types/commonTypes"
import { getTimeFromNow } from "../../../../../helperFunctions/HelperFunctions"
import LinkifyText from "../../../../../util/LinkifyText"
import EmotesPopUp from "./EmotesPopUp"
import EmotesPreview from "./EmotesPreview"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dayjs = require("dayjs")
// eslint-disable-next-line @typescript-eslint/no-var-requires
const relativeTime = require("dayjs/plugin/relativeTime")
dayjs.extend(relativeTime)

const styles = sxStyles({
   root: {
      display: "flex",
      justifyContent: "flex-start",
      flexWrap: "nowrap",
      alignItems: "center",
   },
   rootMe: {
      justifyContent: "flex-start",
      flexDirection: "row-reverse",
   },
   chatButtons: {
      opacity: 0.3,
   },
   chatWrapper: {
      my: 0.7,
      maxWidth: "74%",
      width: "min-content",
      display: "flex",
      position: "relative",
   },
   chatWrapperLast: {
      mb: 0,
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
   setChatEntryIdToDelete: React.Dispatch<React.SetStateAction<string>>
   userIsStreamer: boolean
   isStreamAdmin: boolean
}
const ChatEntryContainer = ({
   chatEntry,
   handleSetCurrentEntry,
   last,
   setChatEntryIdToDelete,
   userIsStreamer,
   isStreamAdmin,
}: Props) => {
   const firebase = useFirebaseService()
   const isNew = chatEntry.timestamp === null
   const [anchorEl, setAnchorEl] = useState(null)
   const { authenticatedUser, userData } = useAuth()

   const [time, setTime] = useState(getTimeFromNow(chatEntry.timestamp))

   const isMe = chatEntry?.authorEmail === authenticatedUser?.email

   const isStreamer =
      chatEntry?.authorEmail === "Streamer" || chatEntry.type === "streamer"

   const canDelete =
      isMe || userIsStreamer || userData?.isAdmin || isStreamAdmin

   const hasTimestamp = Boolean(chatEntry.timestamp)

   useEffect(() => {
      setTime(getTimeFromNow(chatEntry.timestamp))
      const interval = setInterval(() => {
         setTime(getTimeFromNow(chatEntry.timestamp))
      }, 60000)
      return () => clearInterval(interval)
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [hasTimestamp])

   const handleOpenEmotesMenu = (event) => {
      setAnchorEl(event.currentTarget)
   }
   const handleCloseEmotesMenu = () => {
      setAnchorEl(null)
   }

   const handleClickDeleteChatEntry = useCallback(() => {
      setChatEntryIdToDelete(chatEntry.id)
   }, [chatEntry.id, setChatEntryIdToDelete])

   const handleClickPreview = () => handleSetCurrentEntry(chatEntry)

   const open = Boolean(anchorEl)
   return (
      <Fade left={!isMe && isNew} right={Boolean(isMe && isNew)} duration={250}>
         <Box sx={[styles.root, isMe && styles.rootMe]}>
            <Box
               component={"span"}
               sx={[styles.chatWrapper, last && styles.chatWrapperLast]}
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
                     sx={[
                        styles.author,
                        (isMe || isStreamer) && styles.textWhite,
                     ]}
                  >
                     {chatEntry.authorName}
                  </Typography>
                  <Typography
                     align="right"
                     sx={[
                        styles.stamp,
                        (isMe || isStreamer) && styles.textWhite,
                     ]}
                  >
                     {time || "..."}
                  </Typography>
               </Box>
               <EmotesPreview
                  onClick={handleClickPreview}
                  chatEntry={chatEntry}
               />
            </Box>
            <Box sx={styles.chatButtons}>
               <IconButton size="small" onClick={handleOpenEmotesMenu}>
                  <EmojiEmotionsOutlinedIcon fontSize={"small"} />
               </IconButton>
               {Boolean(canDelete) && (
                  <IconButton onClick={handleClickDeleteChatEntry} size="small">
                     <DeleteForeverIcon fontSize={"small"} />
                  </IconButton>
               )}
            </Box>
         </Box>
      </Fade>
   )
}

export default memo(ChatEntryContainer, isEqual)
