import PropTypes from "prop-types"
import React, { useCallback, useEffect, useMemo } from "react"
import { useDispatch } from "react-redux"
import { v4 as uuidv4 } from "uuid"
import {
   Button,
   CircularProgress,
   DialogActions,
   DialogContent,
   DialogTitle,
   List,
   Tab,
   Tabs,
} from "@mui/material"

import * as actions from "../../../../../../store/actions"
import { GlassDialog } from "../../../../../../materialUI/GlobalModals"
import { SwipeablePanel } from "../../../../../../materialUI/GlobalPanels/GlobalPanels"
import { withFirebase } from "../../../../../../context/firebase/FirebaseServiceContext"
import { useCurrentStream } from "../../../../../../context/stream/StreamContext"

import PanelDisplay from "./PanelDisplay"
import EmotesModalUser from "./EmotesModalUser"
import { TEST_EMAIL } from "./utils"
import { isLoaded } from "react-redux-firebase"
import makeStyles from "@mui/styles/makeStyles"
import useStreamRef from "../../../../../custom-hook/useStreamRef"
import usePopulatedChatEntry from "../../../../../custom-hook/usePopulatedChatEntry"

const useStyles = makeStyles((theme) => ({
   loaderContent: {
      display: "grid",
      placeItems: "center",
      minHeight: "20vh",
   },
}))
const EmotesModal = ({ onClose, chatEntry, firebase }) => {
   const classes = useStyles()
   const streamRef = useStreamRef()
   const dispatch = useDispatch()
   const {
      currentLivestream: { id, test },
   } = useCurrentStream()
   const [value, setValue] = React.useState(0)
   const [loading, setLoading] = React.useState(false)

   const populatedChatEntry = usePopulatedChatEntry(chatEntry)

   const getInitials = (userObj) => {
      const { firstName, lastName } = userObj
      let initials = ""
      if (firstName) {
         initials = `${firstName[0]}`
         if (lastName) {
            initials = `${initials} ${lastName[0]}`
         }
      }
      return initials
   }
   const getDisplayName = (userObj) => {
      const { firstName, lastName, id } = userObj
      let displayName = "Anonymous user"
      if (firstName && lastName) {
         displayName = `${firstName} ${lastName[0]}`
      } else if (id === TEST_EMAIL) {
         displayName = test ? "Test user" : "Streamer"
      }
      return displayName
   }

   const { emotes, all } = useMemo(() => {
      let emotesWithData = []
      let allUsers = []
      if (populatedChatEntry) {
         const { wow, heart, thumbsUp, laughing } = populatedChatEntry
         emotesWithData = [
            {
               label: "Wow",
               prop: "wow",
               data: wow,
               src: "/emojis/wow.png",
               alt: "😮",
            },
            {
               label: "Heart",
               prop: "heart",
               data: heart,
               src: "/emojis/heart.png",
               alt: "❤",
            },
            {
               label: "Thumbs Up",
               prop: "thumbsUp",
               data: thumbsUp,
               src: "/emojis/thumbsUp.png",
               alt: "👍",
            },
            {
               label: "Laughing",
               prop: "laughing",
               data: laughing,
               src: "/emojis/laughing.png",
               alt: "😆",
            },
         ]
            .filter((emote) => emote.data?.length)
            .map((obj, index) => ({
               ...obj,
               index: index + 1,
               data: obj.data.map((userObj) => ({
                  email: userObj.id,
                  displayName: getDisplayName(userObj),
                  initials: getInitials(userObj),
                  avatar: userObj.avatarUrl || "",
                  emojiSrc: obj.src,
                  emojiAlt: obj.alt,
                  prop: obj.prop,
               })),
            }))
         allUsers = emotesWithData.reduce(
            (acc, currentEmoteObj) => [...acc, ...currentEmoteObj.data],
            []
         )
      }
      return { all: allUsers, emotes: emotesWithData }
   }, [populatedChatEntry])

   useEffect(() => {
      if (value > 0 && !emotes?.[value - 1]) {
         setValue(0)
      }
   }, [value, emotes])
   const handleChange = (event, newValue) => {
      setValue(newValue)
   }

   const handleUnEmote = useCallback(
      async (emoteProp, emoteEmail) => {
         try {
            setLoading(true)
            await firebase.unEmoteComment(
               streamRef,
               chatEntry.id,
               emoteProp,
               emoteEmail
            )
         } catch (e) {
            dispatch(actions.sendGeneralError(e))
         }
         setLoading(false)
      },
      [loading, id, chatEntry]
   )

   const handleClose = () => {
      onClose()
   }

   return (
      <GlassDialog
         maxWidth="sm"
         fullWidth
         open={Boolean(chatEntry)}
         onClose={handleClose}
      >
         <DialogTitle>Message Reactions</DialogTitle>
         <Tabs
            indicatorColor="primary"
            value={value}
            onChange={handleChange}
            aria-label="simple tabs example"
         >
            <Tab label="All" />
            {emotes.map(({ index, src, alt, data }) => (
               <Tab
                  key={index}
                  label={
                     <PanelDisplay
                        count={data.length}
                        imageAlt={alt}
                        imageSrc={src}
                     />
                  }
               />
            ))}
         </Tabs>
         {!isLoaded(populatedChatEntry) ? (
            <DialogContent className={classes.loaderContent} dividers>
               <CircularProgress />
            </DialogContent>
         ) : (
            <DialogContent dividers>
               <SwipeablePanel index={0} value={value}>
                  <List>
                     {all.map(
                        ({
                           avatar,
                           email,
                           initials,
                           displayName,
                           emojiAlt,
                           emojiSrc,
                           prop,
                        }) => (
                           <EmotesModalUser
                              key={email + prop || uuidv4()}
                              avatar={avatar}
                              email={email}
                              loading={loading}
                              prop={prop}
                              handleUnEmote={handleUnEmote}
                              emojiAlt={emojiAlt}
                              emojiSrc={emojiSrc}
                              initials={initials}
                              displayName={displayName}
                           />
                        )
                     )}
                  </List>
               </SwipeablePanel>
               {emotes.map(({ data, index }) => (
                  <SwipeablePanel key={index} value={value} index={index}>
                     <List>
                        {data.map(
                           ({
                              avatar,
                              email,
                              initials,
                              displayName,
                              emojiAlt,
                              emojiSrc,
                              prop,
                           }) => (
                              <EmotesModalUser
                                 key={email || uuidv4()}
                                 avatar={avatar}
                                 prop={prop}
                                 email={email}
                                 loading={loading}
                                 emojiSrc={emojiSrc}
                                 handleUnEmote={handleUnEmote}
                                 emojiAlt={emojiAlt}
                                 initials={initials}
                                 displayName={displayName}
                              />
                           )
                        )}
                     </List>
                  </SwipeablePanel>
               ))}
            </DialogContent>
         )}
         <DialogActions>
            <Button onClick={handleClose}>Close</Button>
         </DialogActions>
      </GlassDialog>
   )
}

EmotesModal.propTypes = {
   chatEntry: PropTypes.object,
   onClose: PropTypes.func.isRequired,
}

export default withFirebase(EmotesModal)
