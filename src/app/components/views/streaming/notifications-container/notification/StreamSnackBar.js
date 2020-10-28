import React, {useEffect} from 'react';

import {SnackbarProvider, useSnackbar} from 'notistack';
import {Button} from "@material-ui/core";

// const notiObj = {
//     id: notificationId,
//     message: props.request.name + ' is now connecting to the stream',
//     confirmMessage: 'OK',
//     confirm: () => {
//     },
//     cancelMessage: 'Stop Connection',
//     cancel: () => props.updateHandRaiseRequest(props.request.id, 'denied'),
// }
const StreamSnackBar = ({index, notification}) => {
    console.log("-> notification", notification);
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    useEffect(() => {
        const action = key => (
            <>
                <Button style={{marginRight: "1rem"}} color="primary" variant="contained" size="small" onClick={() => {
                    notification.confirm()
                    closeSnackbar(key)
                }}>
                    {notification.confirmMessage}
                </Button>
                <Button variant="contained" size="small" onClick={() => {
                    notification.cancel()
                    closeSnackbar(key)
                }}>
                    {notification.cancelMessage}
                </Button>
            </>
        );

        enqueueSnackbar(notification.message, {
            variant: "default",
            persist: true,
            action
        })

    }, [])


    return (
        <div>

        </div>
    );
};

export default StreamSnackBar;
