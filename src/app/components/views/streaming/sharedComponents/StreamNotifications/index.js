import PropTypes from 'prop-types'
import React, {Fragment, useEffect} from 'react';
import * as actions from '../../../../../store/actions/index';
import {useCurrentStream} from "../../../../../context/stream/StreamContext";
import {withFirebase} from "../../../../../context/firebase";
import {useDispatch} from "react-redux";
import {useAuth} from "../../../../../HOCs/AuthProvider";

const StreamNotifications = ({isStreamer, firebase}) => {
    const dispatch = useDispatch()
    const {userData} = useAuth()
    const {currentLivestream} = useCurrentStream()

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

