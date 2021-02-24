import PropTypes from 'prop-types'
import React, {Fragment, useEffect} from 'react';
import {useSnackbar} from "notistack";
import {useCurrentStream} from "../../../../../context/stream/StreamContext";
import {withFirebase} from "../../../../../context/firebase";

const StreamNotifications = ({isStreamer, firebase}) => {
//TODO Implement a redux Notifier for app
    const {enqueueSnackbar} = useSnackbar()
    const {currentLivestream} = useCurrentStream()

    useEffect(() => {
        if (currentLivestream?.id) {
            firebase.listenToLivestreamParticipatingStudents(currentLivestream.id, querySnapshot => {
                querySnapshot.docChanges().forEach(change => {
                    console.log("-> change", change);
                    if (change.type === "added") {
                        if (change.doc.exists) {
                            const docData = change.doc.data()
                            sendJoinMessage(docData)
                        }
                    }
                })
            })
        }
    }, [currentLivestream?.id])

    const getJoinMessage = (userData) => {
        console.log("-> userData", userData);
        const {firstName, lastName, joined} = userData
        const displayName = firstName ? `${firstName} ${lastName[0]}`: "An anonymous user"
        return `${displayName} joined the room at ${joined?.toDate()}!`
    }

    const sendJoinMessage = (userData) => {
        const message = getJoinMessage(userData)
        enqueueSnackbar(message, {
            variant: "info",
            preventDuplicate: true,
            key: userData?.userEmail,
            // persist: true
        })
    }


    return (
        <Fragment/>
    )

}

StreamNotifications.propTypes = {
  isStreamer: PropTypes.bool
}

export default withFirebase(StreamNotifications);

