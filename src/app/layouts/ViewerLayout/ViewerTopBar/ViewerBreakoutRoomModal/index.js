import React, {useEffect, useMemo} from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import {useFirestoreConnect} from "react-redux-firebase";
import breakoutRoomsSelector from "../../../../components/selectors/breakoutRoomsSelector";
import {useRouter} from "next/router";
import {GlassDialog} from "../../../../materialUI/GlobalModals";
import {Button, Slide} from "@material-ui/core";
import PropTypes from "prop-types";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import * as actions from 'store/actions'
import {closeSnackbar, enqueueSnackbar} from "store/actions";

const useStyles = makeStyles(theme => ({}));

const Content = props => {
    return null;
};

Content.propTypes = {handleClose: PropTypes.any};

const BreakoutSnackAction = ({handleClickConfirm, handleCloseSnackbar}) => {
    const dispatch = useDispatch()


    return (
        <React.Fragment>
            <Button onClick={handleClickConfirm}>
                Checkout
            </Button>
            <Button onClick={handleCloseSnackbar}>
                Dismiss
            </Button>
        </React.Fragment>
    )
}
const ViewerBreakoutRoomModal = ({open, onClose, handleOpen}) => {

    const classes = useStyles()
    const {query: {livestreamId}} = useRouter()
    const dispatch = useDispatch()

    const theme = useTheme()
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));

    const query = useMemo(() => livestreamId ? [{
        collection: "livestreams",
        doc: livestreamId,
        subcollections: [{
            collection: "breakoutRooms",
        }],
        storeAs: `Active BreakoutRooms of ${livestreamId}`,
        where: ["hasStarted", "==", true],
        limit: open ? undefined : 1
    }] : [], [livestreamId, open]);

    useFirestoreConnect(query)
    const breakoutRooms = useSelector(state =>
        breakoutRoomsSelector(state.firestore.ordered[`Active BreakoutRooms of ${livestreamId}`]), shallowEqual
    )


    useEffect(() => {
        console.log("-> Effect Triggered");
        if (!open && breakoutRooms?.length) {
            const message = "There are some breakout rooms active"
            dispatch(actions.enqueueSnackbar({
                message: message,
                options: {
                    variant: "success",
                    key: message,
                    persist: true,
                    preventDuplicate: true,
                    action: <BreakoutSnackAction
                        handleCloseSnackbar={() => handleCloseSnackbar(message)}
                        handleClickConfirm={() => handleClickConfirmSnackbar(message)}
                    />,
                    anchorOrigin: {
                        horizontal: "right",
                        vertical: "top"
                    },
                }
            }))
            // console.log("-> New room!!!!");
        }
    }, [open, Boolean(breakoutRooms?.length)]);

    const handleClickConfirmSnackbar = (key) => {
        handleCloseSnackbar(key)
        handleOpen()
    }
    const handleCloseSnackbar = (key) => {
        dispatch(actions.closeSnackbar(key))
    }

    const handleClose = () => {
        onClose()
    }


    console.log("-> Open BreakoutRooms", breakoutRooms);

    return (
        <GlassDialog TransitionComponent={Slide} fullScreen={mobile} maxWidth="md" fullWidth open={open}
                     onClose={handleClose}>
            <Content handleClose={handleClose}/>
        </GlassDialog>
    );
};

export default ViewerBreakoutRoomModal;
