import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import * as actions from "../../../../../store/actions/index";
import { useCurrentStream } from "../../../../../context/stream/StreamContext";
import { withFirebase } from "../../../../../context/firebase";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../../../HOCs/AuthProvider";
import {
   addMinutes,
   getMinutesPassed,
} from "../../../../helperFunctions/HelperFunctions";
import { makeStyles } from "@material-ui/core/styles";
import useStreamRef from "../../../../custom-hook/useStreamRef";
import CallToActionNotifications from "./CallToActionNotifications";

const useStyles = makeStyles((theme) => ({
   snackBar: {
      maxWidth: 400,
   },
}));
const StreamNotifications = ({ isStreamer, firebase }) => {
   const classes = useStyles();
   const dispatch = useDispatch();
   const streamRef = useStreamRef();
   const { userData } = useAuth();
   const { currentLivestream } = useCurrentStream();
   const [feedbackQuestions, setFeedbackQuestions] = useState([]);
   const [minutesPassed, setMinutesPassed] = useState(null);

   useEffect(() => {
      if (currentLivestream?.id && (userData || isStreamer)) {
         // const unsubscribe = firebase.listenToLivestreamParticipatingStudents(currentLivestream.id, querySnapshot => {
         //     querySnapshot.docChanges().forEach((change, index) => {
         //         if (change.type === "added") {
         //             if (change.doc.exists) {
         //                 const docData = change.doc.data()
         //                 if (userData?.userEmail !== docData?.userEmail) { // make sure you dont get notified of your self joining
         //                     sendJoinMessage(docData, change.type === "modified")
         //                 }
         //             }
         //         }
         //     })
         // })
         // return () => unsubscribe()
      }
   }, [currentLivestream?.id, userData?.userEmail]);

   useEffect(() => {
      if (currentLivestream?.id && isStreamer) {
         const unsubscribeRatings = firebase.listenToLivestreamRatingsWithStreamRef(
            streamRef,
            async (querySnapshot) => {
               setFeedbackQuestions((prevState) => {
                  return querySnapshot.docs.map((doc) => {
                     const oldQuestion = prevState.find(
                        (ratingObj) => ratingObj.id === doc.id
                     );
                     return {
                        id: doc.id,
                        ...doc.data(),
                        hasBeenAsked: Boolean(oldQuestion?.hasBeenAsked),
                     };
                  });
               });
            }
         );
         return () => unsubscribeRatings();
      }
   }, [currentLivestream?.id, isStreamer]);

   useEffect(() => {
      if (feedbackQuestions.length && isStreamer && currentLivestream?.start) {
         const interval = setInterval(() => {
            setMinutesPassed(getMinutesPassed(currentLivestream));
         }, 10 * 1000); // check for minutes passed every 10 seconds
         return () => clearInterval(interval);
      }
   }, [currentLivestream.start, isStreamer, feedbackQuestions]);

   useEffect(() => {
      if (minutesPassed) {
         (async function () {
            await handleCheckFeedback();
         })();
      }
   }, [minutesPassed]);

   const isQuestionActive = (question) => {
      const now = new Date();
      const activeMinutesDuration = 1;
      const streamStart = currentLivestream.start.toDate();
      const questionActiveStart = addMinutes(streamStart, question.appearAfter);
      // Questions will stay active for 2 minutes
      const questionActiveEnd = addMinutes(
         questionActiveStart,
         activeMinutesDuration
      );
      return now >= questionActiveStart && now <= questionActiveEnd;
   };

   const handleCheckFeedback = async () => {
      for (const [index, feedbackQuestion] of feedbackQuestions.entries()) {
         const questionActive = isQuestionActive(feedbackQuestion);
         if (
            questionActive
            // && !feedbackQuestion.hasBeenAsked
         ) {
            // const newFeedbackQuestions = [...feedbackQuestions];
            // newFeedbackQuestions[index].hasBeenAsked = true; // mark that particular rating as already rated
            // setFeedbackQuestions(newFeedbackQuestions); // set updated ratings with new has rated status

            const message = `Your audience is now being asked the following question: ${feedbackQuestion.question}`;
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
            );
         }
      }
   };

   const getJoinMessage = (userData, rejoined) => {
      const { firstName, lastName } = userData;
      const displayName = firstName
         ? `${firstName} ${lastName[0]}`
         : "An anonymous user";
      return `${displayName} ${rejoined ? "rejoined" : "joined"} the room!`;
   };

   const sendJoinMessage = (userData, rejoined) => {
      const message = getJoinMessage(userData, rejoined);
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
      );
   };

   return (
      <CallToActionNotifications
         currentActiveCallToActionIds={currentLivestream.activeCallToActionIds}
         isStreamer={isStreamer}
      />
   );
};

StreamNotifications.propTypes = {
   firebase: PropTypes.any,
   isStreamer: PropTypes.bool,
};

export default withFirebase(StreamNotifications);
