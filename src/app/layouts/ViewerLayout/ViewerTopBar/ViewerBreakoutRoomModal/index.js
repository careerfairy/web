import React, {useEffect, useMemo, useState} from 'react';
import {fade, makeStyles, useTheme} from "@material-ui/core/styles";
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import {useFirestoreConnect} from "react-redux-firebase";
import breakoutRoomsSelector from "../../../../components/selectors/breakoutRoomsSelector";
import {useRouter} from "next/router";
import {
    Box,
    Button, Chip, DialogActions,
    DialogContent,
    DialogTitle,
    Drawer,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Typography
} from "@material-ui/core";
import PropTypes from "prop-types";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import * as actions from 'store/actions'
import Zoom from 'react-reveal/Zoom';
import {getBaseUrl} from "../../../../components/helperFunctions/HelperFunctions";
import Link from "materialUI/NextNavLink";
import {ThemedPermanentMarker} from "../../../../materialUI/GlobalTitles";
import clsx from "clsx";


const useStyles = makeStyles(theme => ({
    contentRoot: {
        // background: theme.palette.background.default
    },
    activeItem: {
        background: `${theme.palette.primary.main} !important`,
        color: `${theme.palette.common.white} !important`,
    },
    breakoutRoomItem: {
        boxShadow: theme.shadows[2],
        borderRadius: theme.shape.borderRadius,
        margin: theme.spacing(1, 0),
        background: theme.palette.background.paper,
        "&:hover": {
            background: theme.palette.background.default,
            color: theme.palette.primary.main,
        },
        textDecoration: "none !important"
    },
    selectedItem: {},
    glass: {
        backgroundColor: fade(theme.palette.common.black, 0.4),
        backdropFilter: "blur(5px)",
    },
    title: {
        textAlign: "left",
        fontSize: theme.typography.h2.fontSize,
        width: "auto"
    }
}));

const Content = ({breakoutRooms, fullyOpened, handleClose}) => {
    const classes = useStyles()
    const {query: {livestreamId, breakoutRoomId}} = useRouter()

    return (
        <div className={classes.contentRoot}>
            <Box paddingY={1} paddingX={2} alignItems="center" justifyContent="space-between" display="flex">
                <ThemedPermanentMarker className={classes.title}>
                    Live Rooms
                </ThemedPermanentMarker>
                {breakoutRoomId && (
                    <div>
                        <Button color="primary" variant="contained">
                            Back to main Room
                        </Button>
                    </div>
                )}
            </Box>
            <Box p={1}>
                <Zoom duration={500} left opposite cascade collapse when={Boolean(fullyOpened)}>
                    <div>
                        {breakoutRooms.map(room => {
                            const activeRoom = room.id === breakoutRoomId
                            return (
                                <ListItem
                                    button={!activeRoom}
                                    className={clsx(classes.breakoutRoomItem, {
                                        [classes.activeItem]: activeRoom
                                    })}
                                    classes={{selected: classes.selectedItem}}
                                    component={!activeRoom && Link}
                                    href={`${getBaseUrl()}/streaming/${livestreamId}/breakout-room/${room.id}/viewer`}
                                    key={room.id}
                                >
                                    <ListItemText
                                        primary={room.title}
                                        secondary={activeRoom ? "You're Here" : "Click to checkout"}
                                    />
                                    <Chip
                                        color="primary"
                                        label="Live"
                                    />
                                </ListItem>
                            );
                        })}

                    </div>
                </Zoom>
            </Box>
            <DialogActions>
                <Button onClick={handleClose}>
                    Close
                </Button>
            </DialogActions>
        </div>
    )
};

Content.propTypes = {handleClose: PropTypes.any};

const BreakoutSnackAction = ({handleClickConfirm, handleCloseSnackbar}) => {
    return (
        <React.Fragment>
            <Button
                variant="contained"
                color="primary"
                onClick={handleClickConfirm}
            >
                Checkout
            </Button>
            <Button
                component={Box}
                marginLeft={1}
                onClick={handleCloseSnackbar}
            >
                Dismiss
            </Button>
        </React.Fragment>
    )
}
const ViewerBreakoutRoomModal = ({open, onClose, handleOpen}) => {

    const classes = useStyles()
    const {query: {livestreamId}} = useRouter()
    const dispatch = useDispatch()
    const [fullyOpened, setFullyOpened] = useState(false);
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
        if (!open && breakoutRooms?.length) {
            const message = "There are some breakout rooms active"
            dispatch(actions.enqueueSnackbar({
                message: message,
                options: {
                    variant: "info",
                    key: message,
                    persist: true,
                    preventDuplicate: true,
                    action: <BreakoutSnackAction
                        handleCloseSnackbar={() => handleCloseSnackbar(message)}
                        handleClickConfirm={() => handleClickConfirmSnackbar(message)}
                    />,
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                    },
                }
            }))
        }
    }, [Boolean(breakoutRooms?.length)]);

    const handleClickConfirmSnackbar = (key) => {
        handleCloseSnackbar(key)
        handleOpen()
    }
    const handleCloseSnackbar = (key) => {
        dispatch(actions.closeSnackbar(key))
    }

    const handleClose = () => {
        setFullyOpened(false)
        onClose()
    }

    const handleEntered = () => {
        setFullyOpened(true)
    }

    return (
        <Drawer anchor="top" open={open}
                PaperProps={{
                    className: classes.glass
                }}
                SlideProps={{
                    onEntered: handleEntered,
                }}
                onClose={handleClose}>
            <Content fullyOpened={fullyOpened} breakoutRooms={breakoutRooms} handleClose={handleClose}/>
        </Drawer>
    );
};

export default ViewerBreakoutRoomModal;
