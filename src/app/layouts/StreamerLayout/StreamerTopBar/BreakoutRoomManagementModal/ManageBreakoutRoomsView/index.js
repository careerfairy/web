import React, {useCallback, useEffect, useState} from "react";
import {Button, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import PropTypes from "prop-types";
import {streamShape} from "types";
import {makeStyles} from "@material-ui/core/styles";
import {useDispatch, useSelector} from "react-redux";
import BackToMainRoomIcon from '@material-ui/icons/KeyboardBackspace';
import BreakoutRoom from "./BreakoutRoom";
import {useFirebase} from "context/firebase";
import {useRouter} from "next/router";
import * as actions from 'store/actions'
import Box from "@material-ui/core/Box";
import useStreamToken from "../../../../../components/custom-hook/useStreamToken";
import {useCurrentStream} from "../../../../../context/stream/StreamContext";

const useStyles = makeStyles(theme => ({
    breakoutRoomsContent: {
        // background: theme.palette.background.default
    },
}));

const ManageBreakoutRoomsView = ({breakoutRooms, handleClose}) => {
    const classes = useStyles()
    const {isMainStreamer} = useCurrentStream()
    const links = useStreamToken({forStreamType: "mainLivestream"})
    const {openAllBreakoutRooms, closeAllBreakoutRooms} = useFirebase()
    const {query: {livestreamId, breakoutRoomId}, push} = useRouter()
    const dispatch = useDispatch()
    const rtmClient = useSelector(state => state.rtmClient)
    const rtmChannel = useSelector(state => state.rtmChannel)
    const rtcClient = useSelector(state => state.rtcClient)

    const [memberCounts, setMemberCounts] = useState({});
    const [allRoomsOpen, setAllRoomsOpen] = useState(false);
    const [allRoomsClosed, setAllRoomsClosed] = useState(false);
    const [openRoom, setOpenRoom] = useState("");
    const [opening, setOpening] = useState(false);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        getAllMemberCounts()
    }, [breakoutRooms])

    useEffect(() => {
        setAllRoomsOpen(breakoutRooms.every(room => room.hasStarted))
        setAllRoomsClosed(breakoutRooms.every(room => !room.hasStarted))
    }, [breakoutRooms])

    const getAllMemberCounts = async () => {
        if (rtmClient) {
            const breakoutRoomIds = breakoutRooms.map(room => room.id)
            const channelMemberCountObj = await rtmClient.getChannelMemberCount(breakoutRoomIds)
            setMemberCounts(channelMemberCountObj)
        }
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
        if (rtmChannel) {
            rtmChannel.removeAllListeners()
            await rtmChannel.leave()
        }
        if (rtmClient) {
            rtmClient.removeAllListeners()
            await rtmClient.logout()
        }
        if (rtcClient) {
            await rtcClient.leave()
        }
    }

    const handleBackToMainRoom = async () => {
        await handleDisconnect()
        handleClose()
        const targetPath = isMainStreamer ? links.mainStreamerLink : links.joiningStreamerLink
        await push({pathname: targetPath, query: {auto: true}}, undefined, {shallow: false})
    }

    return (
        <React.Fragment>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <DialogTitle>
                    Manage Breakout Rooms
                    {/*- {breakoutRooms.length}*/}
                </DialogTitle>
                {breakoutRoomId &&
                (<Box py={2} px={1.5}>
                    <Button
                        onClick={handleBackToMainRoom}
                        startIcon={<BackToMainRoomIcon/>}
                    >
                        Back to main Room
                    </Button>
                </Box>)
                }
            </Box>
            <DialogContent className={classes.breakoutRoomsContent} dividers>
                {breakoutRooms.map((room, index) => (
                    <BreakoutRoom
                        updateMemberCount={updateMemberCount}
                        rtmClient={rtmClient}
                        index={index}
                        openRoom={openRoom}
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
                    Cancel
                </Button>
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

            </DialogActions>
        </React.Fragment>
    )
}
ManageBreakoutRoomsView.propTypes = {
    breakoutRooms: PropTypes.arrayOf(PropTypes.shape(streamShape)).isRequired
}

export default ManageBreakoutRoomsView