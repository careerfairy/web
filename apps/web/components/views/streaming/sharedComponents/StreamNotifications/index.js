import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import * as actions from "../../../../../store/actions/index"
import { useCurrentStream } from "../../../../../context/stream/StreamContext"
import { withFirebase } from "../../../../../context/firebase/FirebaseServiceContext"
import { useDispatch } from "react-redux"
import {
   addMinutes,
   getMinutesPassed,
} from "../../../../helperFunctions/HelperFunctions"
import makeStyles from "@mui/styles/makeStyles"
import useStreamRef from "../../../../custom-hook/useStreamRef"
import CallToActionNotifications from "./CallToActionNotifications"
import { useRouter } from "next/router"

const useStyles = makeStyles((theme) => ({
   snackBar: {
      maxWidth: 400,
   },
}))
const StreamNotifications = ({ isStreamer, firebase }) => {
   const classes = useStyles()
   const dispatch = useDispatch()
   const streamRef = useStreamRef()
   const { currentLivestream } = useCurrentStream()
   const [feedbackQuestions, setFeedbackQuestions] = useState([])
   const [minutesPassed, setMinutesPassed] = useState(null)
   const {
      query: { isRecordingWindow },
   } = useRouter()

   useEffect(() => {
      if (currentLivestream?.id && isStreamer) {
         const unsubscribeRatings =
            firebase.listenToLivestreamRatingsWithStreamRef(
               streamRef,
               async (querySnapshot) => {
                  setFeedbackQuestions((prevState) => {
                     return querySnapshot.docs.map((doc) => {
                        const oldQuestion = prevState.find(
                           (ratingObj) => ratingObj.id === doc.id
                        )
                        return {
                           id: doc.id,
                           ...doc.data(),
                           hasBeenAsked: Boolean(oldQuestion?.hasBeenAsked),
                        }
                     })
                  })
               }
            )
         return () => unsubscribeRatings()
      }
   }, [currentLivestream?.id, isStreamer])

   useEffect(() => {
      if (feedbackQuestions.length && isStreamer && currentLivestream?.start) {
         const interval = setInterval(() => {
            setMinutesPassed(getMinutesPassed(currentLivestream))
         }, 10 * 1000) // check for minutes passed every 10 seconds
         return () => clearInterval(interval)
      }
   }, [currentLivestream.start, isStreamer, feedbackQuestions])

   useEffect(() => {
      if (minutesPassed) {
         ;(async function () {
            await handleCheckFeedback()
         })()
      }
   }, [minutesPassed])

   const isQuestionActive = (question) => {
      const now = new Date()
      const activeMinutesDuration = 1
      const streamStart = currentLivestream.start.toDate()
      const questionActiveStart = addMinutes(streamStart, question.appearAfter)
      // Questions will stay active for 2 minutes
      const questionActiveEnd = addMinutes(
         questionActiveStart,
         activeMinutesDuration
      )
      return now >= questionActiveStart && now <= questionActiveEnd
   }

   const handleCheckFeedback = async () => {
      for (const [index, feedbackQuestion] of feedbackQuestions.entries()) {
         const questionActive = isQuestionActive(feedbackQuestion)
         if (
            questionActive
            // && !feedbackQuestion.hasBeenAsked
         ) {
            // const newFeedbackQuestions = [...feedbackQuestions];
            // newFeedbackQuestions[index].hasBeenAsked = true; // mark that particular rating as already rated
            // setFeedbackQuestions(newFeedbackQuestions); // set updated ratings with new has rated status

            const message = `Your audience is now being asked the following question: ${feedbackQuestion.question}`
            dispatch(
               actions.enqueueSnackbar({
                  message,
                  options: {
                     variant: "info",
                     key: feedbackQuestion.id,
                     preventDuplicate: true,
                     className: classes.snackBar,
                  },
               })
            )
         }
      }
   }

   const getJoinMessage = (userData, rejoined) => {
      const { firstName, lastName } = userData
      const displayName = firstName
         ? `${firstName} ${lastName[0]}`
         : "An anonymous user"
      return `${displayName} ${rejoined ? "rejoined" : "joined"} the room!`
   }

   const sendJoinMessage = (userData, rejoined) => {
      const message = getJoinMessage(userData, rejoined)
      dispatch(
         actions.enqueueSnackbar({
            message,
            options: {
               variant: "info",
               preventDuplicate: true,
               key: userData?.userEmail,
               autoHideDuration: 3000,
            },
         })
      )
   }

   return isRecordingWindow ? null : (
      <CallToActionNotifications
         currentActiveCallToActionIds={currentLivestream.activeCallToActionIds}
         isStreamer={isStreamer}
      />
   )
}

StreamNotifications.propTypes = {
   firebase: PropTypes.any,
   isStreamer: PropTypes.bool,
}

export default withFirebase(StreamNotifications)
