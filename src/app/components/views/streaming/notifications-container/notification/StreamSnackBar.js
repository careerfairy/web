import React, {useEffect} from 'react';

import {useSnackbar} from 'notistack';
import {Button} from "@material-ui/core";

const StreamSnackBar = ({index, notification}) => {
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    useEffect(() => {

        enqueueSnackbar(notification.message, {
            variant: "default",
            persist: true,
            action
        })

    }, [])

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

    return (
        <div>

        </div>
    );
};

export default StreamSnackBar;
