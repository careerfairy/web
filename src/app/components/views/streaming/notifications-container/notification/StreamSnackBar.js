import React, {useContext, useEffect} from 'react';

import {useSnackbar} from 'notistack';
import {Button} from "@material-ui/core";
import TutorialContext from "../../../../../context/tutorials/TutorialContext";

const StreamSnackBar = ({ notification}) => {
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const {handleConfirmStep, isOpen} = useContext(TutorialContext);

    useEffect(() => {
        enqueueSnackbar(notification.message, {
            variant: "info",
            persist: notification.status !== "connected",
            action,
            key: notification.id,
            preventDuplicate: true,
        })

        // Dismisses the notification once the component unmounts
        return () => closeSnackbar(notification.id)
    }, [])

    const action = key => {
        return (
            <>
                <Button style={{marginRight: "1rem"}} color="primary" variant="contained" size="small" onClick={() => {
                    notification.confirm()
                    if (isOpen(10)) {
                        handleConfirmStep(10)
                    }
                    closeSnackbar(key)
                }}>
                    {notification.confirmMessage}
                </Button>
                <Button disabled={isOpen(10)} variant="contained" size="small" onClick={() => {
                    notification.cancel()
                    closeSnackbar(key)
                }}>
                    {notification.cancelMessage}
                </Button>
            </>
        )
    };

    return (
        <div>

        </div>
    );
};

export default StreamSnackBar;
