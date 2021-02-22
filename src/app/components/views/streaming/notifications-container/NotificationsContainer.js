import React, {Fragment, useEffect} from 'react';
import StreamSnackBar from "./notification/StreamSnackBar";
import {withFirebase} from "../../../../context/firebase";
import {useSnackbar} from "notistack";

function NotificationsContainer({notifications, livestreamId, firebase}) {

    const {enqueueSnackbar} = useSnackbar()

    useEffect(() => {
        if (livestreamId) {
            firebase.listenToLivestreamParticipatingStudents(livestreamId, querySnapshot => {
                querySnapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        console.log("-> change", change);
                        if (change.doc.exists) {
                            const docData = change.doc.data()
                            sendJoinMessage(docData)
                        }
                    }
                })
            })
        }
    }, [livestreamId])

    const getJoinMessage = (userData) => {
        const {firstName, lastName} = userData
        const displayName = firstName ? `${firstName} ${lastName[0]}`: "An anonymous user"
        return `${displayName} joined the room!`
    }

    const sendJoinMessage = (userData) => {
        const message = getJoinMessage(userData)
        enqueueSnackbar(message, {
            variant: "info",
            preventDuplicate: true,
            key: userData?.userEmail
        })
    }

    let streamSnackElements = notifications.map((notification, index) => {
        return (
            <StreamSnackBar key={index} notification={notification} index={index}/>
        )
    })

    return (
        <Fragment>
            {streamSnackElements}
        </Fragment>
    )

}

export default withFirebase(NotificationsContainer);