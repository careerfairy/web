import {Fragment} from 'react';
import Notification from './notification/Notification'
import {SnackbarProvider, useSnackbar} from 'notistack';
import StreamSnackBar from "./notification/StreamSnackBar";

function NotificationsContainer({notifications}) {

    let notificationElements = notifications.map((notification, index) => {
        return (
            <Notification notification={notification} index={index}/>
        );
    })

    let streamSnackElements = notifications.map((notification, index) => {
        return (
            <StreamSnackBar notification={notification} index={index}/>
        )
    })

    return (
        <Fragment>
            {streamSnackElements}
        </Fragment>
    )


    return (
        <Fragment>
            {notificationElements}
        </Fragment>
    );
}

export default NotificationsContainer;