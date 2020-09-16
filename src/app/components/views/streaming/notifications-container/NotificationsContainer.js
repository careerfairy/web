import { Fragment} from 'react';
import Notification from './notification/Notification'

function NotificationsContainer({ notifications }) {

    let notificationElements = notifications.map((notification, index) => {
        return (
            <Notification notification={notification} index={index} />
        );
    })

    return (
        <Fragment>
            { notificationElements }
        </Fragment>
    );
}

export default NotificationsContainer;