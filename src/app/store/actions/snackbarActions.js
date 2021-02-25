import {CLOSE_SNACKBAR, ENQUEUE_SNACKBAR, REMOVE_SNACKBAR} from "./actionTypes";
import {GENERAL_ERROR} from "../../components/util/constants";

export const enqueueSnackbar = (notification) => {
    const key = notification.options && notification.options.key;

    return {
        type: ENQUEUE_SNACKBAR,
        notification: {
            ...notification,
            key: key || new Date().getTime() + Math.random(),
        },
    };
};

export const closeSnackbar = key => ({
    type: CLOSE_SNACKBAR,
    dismissAll: !key, // dismiss all if no key has been defined
    key,
});

export const removeSnackbar = key => ({
    type: REMOVE_SNACKBAR,
    key,
});

export const sendGeneralError = (error = "") => async (dispatch) =>{
    console.error("error", error)
    dispatch(enqueueSnackbar({
        message: GENERAL_ERROR,
        options:{
            variant: "error",
            preventDuplicate: true
        }
    }))
}

