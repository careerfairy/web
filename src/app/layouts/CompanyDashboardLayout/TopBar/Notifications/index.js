import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardContent, CardHeader, Popover} from "@material-ui/core";
import NotificationItem from "./NotificationItem";

const useStyles = makeStyles(theme => ({
    root: {
        marginRight: theme.spacing(1)
    },
    notificationsTitle: {},
    content: {
        padding: `${theme.spacing(0.5)}px !important`
    }
}));

const Notifications = ({notifications, anchorEl, handleClose}) => {

    const classes = useStyles()

    return (
        <Popover
            className={classes.root}
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
        >
            <Card>
                <CardHeader
                    title="Notifications"
                    subheader={notifications.length ? "New" : "You have no notifications"}
                />
                <CardContent className={classes.content}>
                    {notifications.map(({details, created, updated, id}) =>
                        <NotificationItem
                            key={id}
                            handleClose={handleClose}
                            id={id}
                            type={details.type}
                            created={created}
                            updated={updated}
                        />)}
                </CardContent>
            </Card>
        </Popover>
    );
};

export default Notifications;
