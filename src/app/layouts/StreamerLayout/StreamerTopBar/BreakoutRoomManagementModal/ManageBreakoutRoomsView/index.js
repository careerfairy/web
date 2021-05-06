import React, {useCallback, useEffect, useState} from "react";
import {Button, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import PropTypes from "prop-types";
import {streamShape} from "types";
import {makeStyles} from "@material-ui/core/styles";
import {useSelector} from "react-redux";
import BreakoutRoom from "./BreakoutRoom";

const useStyles = makeStyles(theme => ({
    breakoutRoomsContent: {
        background: theme.palette.background.default
    },
}));

const ManageBreakoutRoomsView = ({breakoutRooms, handleClose}) => {
    const classes = useStyles()
    const rtmClient = useSelector(state => state.rtmClient)
    const [memberCounts, setMemberCounts] = useState({});
    const [openRoom, setOpenRoom] = useState(breakoutRooms[0].id);

    useEffect(() => {
        getAllMemberCounts()
    }, [breakoutRooms])

    const getAllMemberCounts = async () => {
        const breakoutRoomIds = breakoutRooms.map(room => room.id)
        const channelMemberCountObj = await rtmClient.getChannelMemberCount(breakoutRoomIds)
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
            </DialogActions>
        </React.Fragment>
    )
}
ManageBreakoutRoomsView.propTypes = {
    breakoutRooms: PropTypes.arrayOf(PropTypes.shape(streamShape)).isRequired
}

export default ManageBreakoutRoomsView