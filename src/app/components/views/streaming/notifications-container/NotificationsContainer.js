import React, {Fragment} from 'react';
import StreamSnackBar from "./notification/StreamSnackBar";

function NotificationsContainer({notifications}) {

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

export default NotificationsContainer;