import React, {useCallback, useEffect, useState} from "react";
import {Button, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import PropTypes from "prop-types";
import {streamShape} from "types";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {useDispatch} from "react-redux";
import BreakoutRoom from "./BreakoutRoom";
import {useFirebase} from "context/firebase";
import {useRouter} from "next/router";
import * as actions from 'store/actions'
import Box from "@material-ui/core/Box";
import useStreamToken from "../../../../../components/custom-hook/useStreamToken";
import {useCurrentStream} from "../../../../../context/stream/StreamContext";
import BreakoutRoomOptions from "./BreakoutRoomOptions";
import BreakoutRoomSettings from "./BreakoutRoomSettings";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import clsx from "clsx";
import BackToMainRoomIcon from "@material-ui/icons/ArrowBackIos";
import {addQueryParam} from "../../../../../components/helperFunctions/HelperFunctions";

const useStyles = makeStyles(theme => ({
    breakoutRoomsContent: {
        // background: theme.palette.background.default
    },
    contentMobile: {
        padding: theme.spacing(1)
    }
}));


const ManageBreakoutRoomsView = ({breakoutRooms, handleClose, agoraHandlers}) => {
    const classes = useStyles()
    const {isMainStreamer} = useCurrentStream()
    const theme = useTheme()
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));
    const links = useStreamToken({forStreamType: "mainLivestream"})
    const {openAllBreakoutRooms, closeAllBreakoutRooms} = useFirebase()
    const {query: {livestreamId, breakoutRoomId}} = useRouter()
    const dispatch = useDispatch()
    const [view, setView] = useState("main");
    const [memberCounts, setMemberCounts] = useState({});
    const [allRoomsOpen, setAllRoomsOpen] = useState(false);
    const [allRoomsClosed, setAllRoomsClosed] = useState(false);
    const [openRoom, setOpenRoom] = useState("");
    const [opening, setOpening] = useState(false);
    const [closing, setClosing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        getAllMemberCounts()
    }, [breakoutRooms])

    useEffect(() => {
        setAllRoomsOpen(breakoutRooms.every(room => room.hasStarted))
        setAllRoomsClosed(breakoutRooms.every(room => !room.hasStarted))
    }, [breakoutRooms])


    const getAllMemberCounts = async () => {
        const breakoutRoomIds = breakoutRooms.map(room => room.id)
        const channelMemberCountObj = await agoraHandlers.getChannelMemberCount(breakoutRoomIds)
        setMemberCounts(channelMemberCountObj)
    }

    const updateMemberCount = useCallback((roomId, newCount) => {
        setMemberCounts(prevState => ({
            ...prevState,
            [roomId]: newCount
        }))
    }, [])

    const handleOpenAccordion = useCallback((roomId) => {
        setOpenRoom(roomId)
    }, [])

    const handleOpenAllRooms = async () => {
        try {
            setOpening(true)
            await openAllBreakoutRooms(livestreamId)
        } catch (e) {
            dispatch(actions.sendGeneralError(e))
        }
        setOpening(false)
    }
    const handleCloseAllRooms = async () => {
        try {
            setClosing(true)
            await closeAllBreakoutRooms(livestreamId)
        } catch (e) {
            dispatch(actions.sendGeneralError(e))
        }
        setClosing(false)
    }

    const handleDisconnect = async () => {
        await agoraHandlers.handleDisconnect()
    }

    const handleBackToMainRoom = async () => {
        await handleDisconnect()
        handleClose()
        const targetPath = isMainStreamer ? links.mainStreamerLink : links.joiningStreamerLink
        window.location.href = addQueryParam(targetPath, "auto=true")
    }

    const handleRefresh = async () => {
        try {
            setRefreshing(true)
            await getAllMemberCounts()
        } catch (e) {
            dispatch(actions.sendGeneralError(e))
        }
        setRefreshing(false)
    }

    const openSettings = () => {
        setView("settings")
    }

    const openMain = () => {
        setView("main")
    }

    if (view === "settings") {
        return (
            <BreakoutRoomSettings
                onClick={openMain}
                classes={classes}
                handleClose={handleClose}
            />
        )
    }

    return (
        <React.Fragment>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <DialogTitle>
                    {mobile ? "Manage" : "Manage Breakout Rooms"}
                </DialogTitle>
                <Box flex={1}/>
                {breakoutRoomId &&
                <Button
                    onClick={handleBackToMainRoom}
                    variant="contained"
                    size={mobile ? "small" : "medium"}
                    color="primary"
                    startIcon={
                        <BackToMainRoomIcon/>
                    }
                    style={{marginRight: 16}}
                >
                    Back to main Room
                    {/*{mobile ? "Back" : "Back to main Room"}*/}
                </Button>}
                {isMainStreamer &&
                <BreakoutRoomOptions
                    openSettings={openSettings}
                    isMainStreamer={isMainStreamer}
                    handleRefresh={handleRefresh}
                    loading={refreshing}
                />}
            </Box>
            <DialogContent className={clsx(classes.breakoutRoomsContent, {
                [classes.contentMobile]: mobile
            })} dividers>
                {breakoutRooms.map((room, index) => (
                    <BreakoutRoom
                        updateMemberCount={updateMemberCount}
                        index={index}
                        isMainStreamer={isMainStreamer}
                        agoraHandlers={agoraHandlers}
                        openRoom={openRoom}
                        refreshing={refreshing}
                        mobile={mobile}
                        handleDisconnect={handleDisconnect}
                        handleClose={handleClose}
                        handleOpenAccordion={handleOpenAccordion}
                        key={room.id}
                        memberCount={memberCounts[room.id]}
                        breakoutRoom={room}
                    />
                ))}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    Close
                </Button>
                {isMainStreamer && <React.Fragment>
                    <Box flex={1}/>
                    {!allRoomsClosed &&
                    <Button
                        disabled={closing || opening}
                        variant="contained"
                        color="secondary"
                        onClick={handleCloseAllRooms}
                    >
                        Close All Rooms
                    </Button>}
                    {!allRoomsOpen &&
                    <Button
                        disabled={closing || opening}
                        variant="contained"
                        color="primary"
                        onClick={handleOpenAllRooms}
                    >
                        Start All Rooms
                    </Button>}
                </React.Fragment>}
            </DialogActions>
        </React.Fragment>
    )
}
ManageBreakoutRoomsView.propTypes = {
    breakoutRooms: PropTypes.arrayOf(PropTypes.shape(streamShape)).isRequired
}

export default ManageBreakoutRoomsView