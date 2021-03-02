import PropTypes from 'prop-types'
import React, {useEffect, useState} from 'react';
import * as actions from '../../../../../store/actions/index';
import {useCurrentStream} from "../../../../../context/stream/StreamContext";
import {withFirebase} from "../../../../../context/firebase";
import {useDispatch} from "react-redux";
import {useAuth} from "../../../../../HOCs/AuthProvider";
import {addMinutes, getMinutesPassed} from "../../../../helperFunctions/HelperFunctions";
import {makeStyles} from "@material-ui/core/styles";
import {Button} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    snackBar: {
        maxWidth: 400
    }
}))
const StreamNotifications = ({isStreamer, firebase, showAudience}) => {
    const classes = useStyles()
    const dispatch = useDispatch()
    const {userData} = useAuth()
    const {currentLivestream} = useCurrentStream()
    const [feedbackQuestions, setFeedbackQuestions] = useState([]);
    const [minutesPassed, setMinutesPassed] = useState(null);

    useEffect(() => {
        if (currentLivestream?.id && (userData || isStreamer)) {
            firebase.listenToLivestreamParticipatingStudents(currentLivestream.id, querySnapshot => {
                console.log("-> querySnapshot.docChanges()", querySnapshot.docChanges());
                querySnapshot.docChanges().forEach((change, index) => {
                        console.log("-> change", change);
                        // console.log("-> index", index);
                    if (change.type === "added") {
                        if (change.doc.exists) {
                            const docData = change.doc.data()
                            if (userData?.userEmail !== docData?.userEmail) { // make sure you dont see your self joining
                                sendJoinMessage(docData, change.type === "modified")
                            }
                        }
                    }
                })
            })
        }
    }, [currentLivestream?.id, userData?.userEmail])

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
            }, 10 * 1000); // check for minutes passed every 10 seconds
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
        const activeMinutesDuration = 1
        const streamStart = currentLivestream.start.toDate()
        const questionActiveStart = addMinutes(streamStart, question.appearAfter)
        // Questions will stay active for 2 minutes
        const questionActiveEnd = addMinutes(questionActiveStart, activeMinutesDuration)
        return (now >= questionActiveStart && now <= questionActiveEnd)
    }

    const handleCheckFeedback = async () => {
        for (const [index, feedbackQuestion] of feedbackQuestions.entries()) {
            const questionActive = isQuestionActive(feedbackQuestion)
            if (questionActive
                // && !feedbackQuestion.hasBeenAsked
            ) {
                // const newFeedbackQuestions = [...feedbackQuestions];
                // newFeedbackQuestions[index].hasBeenAsked = true; // mark that particular rating as already rated
                // setFeedbackQuestions(newFeedbackQuestions); // set updated ratings with new has rated status

                const message = `Your audience is now being asked the following question: ${feedbackQuestion.question}`
                dispatch(actions.enqueueSnackbar({
                    message,
                    options: {
                        variant: "info",
                        key: feedbackQuestion.id,
                        preventDuplicate: true,
                        className: classes.snackBar
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
        let message = getJoinMessage(userData, rejoined)
        console.log("-> userData", userData);
        message = `${message} at ${userData.joined.toDate()}`
        const action = key => {
            return (
                <Button color="primary" variant="contained" size="small" onClick={() => {
                    showAudience()
                    dispatch(actions.closeSnackbar(key))
                }}>
                    See who else joined
                </Button>
            )
        };
        dispatch(actions.enqueueSnackbar({
            message,
            options: {
                variant: "info",
                preventDuplicate: true,
                key: userData?.userEmail,
                action
            }
        }))
    }


    return null

}

StreamNotifications.propTypes = {
    firebase: PropTypes.any,
    isStreamer: PropTypes.bool,
    showAudience: PropTypes.func.isRequired
}

export default withFirebase(StreamNotifications);

