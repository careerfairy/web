import PropTypes from "prop-types"
import { useCurrentStream } from "../../../../../../context/stream/StreamContext"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import { useDispatch } from "react-redux"
import {
   heartPng,
   laughingPng,
   TEST_EMAIL,
   thumbsUpPng,
   wowPng,
} from "../EmotesModal/utils"
import * as actions from "../../../../../../store/actions"
import React, { Fragment } from "react"
import { IconButton } from "@mui/material"
import clsx from "clsx"
import makeStyles from "@mui/styles/makeStyles"
import { withFirebase } from "context/firebase/FirebaseServiceContext"
import useStreamRef from "../../../../../custom-hook/useStreamRef"

const useStyles = makeStyles((theme) => ({
   emoteImg: {
      cursor: "pointer",
      transition: theme.transitions.create("transform", {
         duration: theme.transitions.duration.short,
         easing: theme.transitions.easing.easeInOut,
      }),
      "&:hover": {
         transform: "scale(1.2) rotate(25deg)",
      },
      width: theme.spacing(3),
      height: theme.spacing(3),
   },
   active: {
      background: theme.palette.action.hover,
   },
}))

const EmotesPopUp = ({
   handleCloseEmotesMenu,
   firebase,
   chatEntry: { id: chatEntryId, wow, heart, thumbsUp, laughing },
}) => {
   const classes = useStyles()
   const streamRef = useStreamRef()
   const {
      currentLivestream: { id },
   } = useCurrentStream()
   const { userData } = useAuth()
   const dispatch = useDispatch()

   const handleEmote = async (emoteProp, active) => {
      try {
         if (active && userData?.userEmail) {
            await firebase.unEmoteComment(
               streamRef,
               chatEntryId,
               emoteProp,
               userData.userEmail
            )
         } else {
            const userEmail = userData?.userEmail || TEST_EMAIL
            await firebase.emoteComment(
               streamRef,
               chatEntryId,
               emoteProp,
               userEmail
            )
         }
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
      handleCloseEmotesMenu()
   }

   const getActive = (arrayOfEmails) => {
      return arrayOfEmails?.includes(userData?.userEmail)
   }

   const emotes = [
      {
         src: laughingPng.src,
         alt: laughingPng.alt,
         prop: "laughing",
         active: getActive(laughing),
      },
      {
         src: wowPng.src,
         alt: wowPng.alt,
         prop: "wow",
         active: getActive(wow),
      },
      {
         src: heartPng.src,
         alt: heartPng.alt,
         prop: "heart",
         active: getActive(heart),
      },
      {
         src: thumbsUpPng.src,
         alt: thumbsUpPng.alt,
         prop: "thumbsUp",
         active: getActive(thumbsUp),
      },
   ]

   return (
      <Fragment>
         {emotes.map(({ prop, src, alt, active }) => (
            <IconButton
               key={prop}
               onClick={() => handleEmote(prop, active)}
               size="medium"
               className={clsx({
                  [classes.active]: active,
               })}
            >
               <img className={classes.emoteImg} alt={alt} src={src} />
            </IconButton>
         ))}
      </Fragment>
   )
}

EmotesPopUp.propTypes = {
   chatEntry: PropTypes.object.isRequired,
   firebase: PropTypes.object,
   handleCloseEmotesMenu: PropTypes.func.isRequired,
}

export default withFirebase(EmotesPopUp)
