import React, {useCallback, useEffect, useState} from "react";
import {Button, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import PropTypes from "prop-types";
import {streamShape} from "types";
import {makeStyles} from "@material-ui/core/styles";
import {useDispatch, useSelector} from "react-redux";
import BreakoutRoom from "./BreakoutRoom";
import {useFirebase} from "context/firebase";
import {useRouter} from "next/router";
import * as actions from 'store/actions'

const useStyles = makeStyles(theme => ({
    breakoutRoomsContent: {
        // background: theme.palette.background.default
    },
}));

const ManageBreakoutRoomsView = ({breakoutRooms, handleClose}) => {
    const classes = useStyles()
    const {openAllBreakoutRooms, closeAllBreakoutRooms} = useFirebase()
    const {query: {livestreamId}} = useRouter()
    const dispatch = useDispatch()
    const rtmClient = useSelector(state => state.rtmClient)
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

    return (
        <React.Fragment>
            <DialogTitle>
                Manage Breakout Rooms - {breakoutRooms.length}
            </DialogTitle>
            <DialogContent className={classes.breakoutRoomsContent} dividers>
                {breakoutRooms.map((room, index) => (
                    <BreakoutRoom
                        updateMemberCount={updateMemberCount}
                        rtmClient={rtmClient}
                        index={index}
                        openRoom={openRoom}
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