import React, {useContext, useEffect} from 'react';

import {useSnackbar} from 'notistack';
import {Button} from "@material-ui/core";
import TutorialContext from "../../../../../context/tutorials/TutorialContext";
import {
    enqueueSnackbar as enqueueSnackbarAction,
    closeSnackbar as closeSnackbarAction,
} from '../../../../../store/actions/snackbarActions';
import {useDispatch} from "react-redux";

const StreamSnackBar = ({notification}) => {
    const dispatch = useDispatch();
    const {handleConfirmStep, isOpen} = useContext(TutorialContext);
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args));
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    useEffect(() => {
        enqueueSnackbar({
            message: notification.message,
            options: {
                variant: "info",
                persist: notification.status !== "connected",
                action,
                key: notification.id,
                preventDuplicate: true,
            }
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
