import PropTypes from 'prop-types'
import React, {Fragment, useEffect, useState} from 'react';
import * as actions from '../../../../../store/actions/index';
import {useCurrentStream} from "../../../../../context/stream/StreamContext";
import {withFirebase} from "../../../../../context/firebase";
import {useDispatch} from "react-redux";
import {useAuth} from "../../../../../HOCs/AuthProvider";
import {addMinutes, getMinutesPassed} from "../../../../helperFunctions/HelperFunctions";

const StreamNotifications = ({isStreamer, firebase}) => {
    const dispatch = useDispatch()
    const {userData} = useAuth()
    const {currentLivestream} = useCurrentStream()
    const [feedbackQuestions, setFeedbackQuestions] = useState([]);
    const [minutesPassed, setMinutesPassed] = useState(null);
    console.log("-> minutesPassed in stream notif", minutesPassed);

    useEffect(() => {
        if (currentLivestream?.id && (userData || isStreamer)) {
            firebase.listenToLivestreamParticipatingStudents(currentLivestream.id, querySnapshot => {
                querySnapshot.docChanges().forEach(change => {
                    if (change.type === "added" || change.type === "modified") {
                        if (change.doc.exists) {
                            const docData = change.doc.data()
                            if (userData?.userEmail !== docData?.userEmail) {
                                sendJoinMessage(docData, change.type === "modified")
                            }
                        }
                    }
                })
            })
        }
    }, [currentLivestream?.id, userData])

    useEffect(() => {
        if (currentLivestream?.id && isStreamer) {
            const unsubscribeRatings = firebase.listenToLivestreamRatings(
                currentLivestream.id,
                async (querySnapshot) => {
                    setFeedbackQuestions(prevState => {
                        return querySnapshot.docs.map((doc) => {
                            const oldQuestion = prevState.find(
                                (ratingObj) => ratingObj.id === doc.id
                            );
                            return {
                                id: doc.id,
                                ...doc.data(),
                                hasBeenAsked: Boolean(oldQuestion?.hasBeenAsked),
                            };
                        })
                    })
                }
            );
            return () => unsubscribeRatings();
        }
    }, [currentLivestream?.id, isStreamer]);

    useEffect(() => {

        if (feedbackQuestions.length && isStreamer && currentLivestream?.start) {
            const interval = setInterval(() => {
                setMinutesPassed(getMinutesPassed(currentLivestream));
            }, 1 * 1000); // check for minutes passed every 10 seconds
            return () => clearInterval(interval);
        }
    }, [currentLivestream.start, isStreamer, feedbackQuestions]);

    useEffect(() => {
        if (minutesPassed) {
            (async function () {
                await handleCheckFeedback();
            })()
        }
    }, [minutesPassed]);

    const isQuestionActive = (question) => {
        const now = new Date()
        const streamStart = currentLivestream.start.toDate()
        const questionActiveStart = addMinutes(streamStart, question.appearAfter)
        // Questions will stay active for 2 minutes
        const questionActiveEnd = addMinutes(questionActiveStart, 2)
        return !question.hasBeenAsked && (now >= questionActiveStart && now <= questionActiveEnd)
    }

    const handleCheckFeedback = async () => {
        for (const [index, feedbackQuestion] of feedbackQuestions.entries()) {
            const questionActive = isQuestionActive(feedbackQuestion)
            if (questionActive) {
                if (!feedbackQuestion.hasBeenAsked) {
                    const newFeedbackQuestions = [...feedbackQuestions];
                    newFeedbackQuestions[index].hasBeenAsked = true; // mark that particular rating as already rated
                    setFeedbackQuestions(newFeedbackQuestions); // set updated ratings with new has rated status
                }
                const message = `Your audience is now being asked the following question: ${feedbackQuestion.question}`
                dispatch(actions.enqueueSnackbar({
                    message,
                    options:{
                        variant: "info",
                    }
                }))
            }
        }
    };

    const getJoinMessage = (userData, rejoined) => {
        const {firstName, lastName} = userData
        const displayName = firstName ? `${firstName} ${lastName[0]}` : "An anonymous user"
        return `${displayName} ${rejoined ? "rejoined" : "joined"} the room!`
    }

    const sendJoinMessage = (userData, rejoined) => {
        const message = getJoinMessage(userData, rejoined)
        dispatch(actions.enqueueSnackbar({
            message,
            options: {
                variant: "info",
                preventDuplicate: true,
                key: userData?.userEmail,
            }
        }))
    }


    return (
        <Fragment/>
    )

}

StreamNotifications.propTypes = {
    isStreamer: PropTypes.bool
}

export default withFirebase(StreamNotifications);

