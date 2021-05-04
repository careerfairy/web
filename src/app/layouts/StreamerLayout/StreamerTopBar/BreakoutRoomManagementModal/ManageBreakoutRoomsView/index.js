import React, {useCallback, useEffect, useState} from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle
} from "@material-ui/core";
import PropTypes from "prop-types";
import {streamShape} from "types";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import RenameRoomIcon from '@material-ui/icons/Edit';
import DeleteRoomIcon from '@material-ui/icons/Close';
import Box from "@material-ui/core/Box";
import {useSelector} from "react-redux";
import {useCurrentStream} from "../../../../../context/stream/StreamContext";

const useStyles = makeStyles(theme => ({
    breakoutRoomsContent: {
        background: theme.palette.background.default
    }
}));

const BreakoutRoomAccordionContent = ({updateMemberCount, roomId, rtmClient}) => {
    // console.log("-> roomId", roomId);
    const {currentLivestream: {id: livestreamId}} = useCurrentStream()
    const [breakoutRoomChannel, setBreakoutRoomChannel] = useState(null);
    const [channelMembers, setChannelMembers] = useState([]);
    console.log("-> channelMembers", channelMembers);
    const rtmChannel = useSelector(state => state.rtmChannel)

    useEffect(() => {
        if (rtmClient && !breakoutRoomChannel) {
            connectToChannel()
        }
        return () => leaveChannel()
    }, [Boolean(rtmClient), Boolean(breakoutRoomChannel)]);

    useEffect(() => {
        if (breakoutRoomChannel) {
            // breakoutRoomChannel.on("")
        }
    }, [Boolean(breakoutRoomChannel)])


    useEffect(() => {
        getMemberCount()
    }, [roomId])

    const leaveChannel = () => {
        if (breakoutRoomChannel) {
            breakoutRoomChannel.leave()
        }
    }

    const connectToChannel = async () => {
        let channel
        if (roomId === livestreamId) {
            channel = rtmChannel
        } else {
            channel = rtmClient.createChannel(roomId)
            await channel.join()
        }
        const members = await channel.getMembers() || []
        setChannelMembers(members)
        setBreakoutRoomChannel(channel)
    }

    const getMemberCount = async () => {
        const channelMemberCountObj = await rtmClient.getChannelMemberCount([roomId])
        const memberCount = channelMemberCountObj[roomId]
        updateMemberCount(roomId, memberCount)
    }

    return (
        <AccordionDetails>
            <Typography color="textSecondary">
                The click event of the nested action will propagate up and expand the accordion unless
                you explicitly stop it.
            </Typography>
        </AccordionDetails>
    );
};

BreakoutRoomAccordionContent.propTypes = {
    roomId: PropTypes.string.isRequired,
};
const BreakoutRoom = ({
                          breakoutRoom: {title, id},
                          openRoom,
                          rtmClient,
                          memberCount,
                          updateMemberCount,
                          handleOpenAccordion
                      }) => {
    const theme = useTheme()

    const handleChange = (panel) => (event, isExpanded) => {
        handleOpenAccordion(isExpanded ? panel : "");
    };

    const handleClickRename = (event) => {
        event.stopPropagation()
    }

    const handleClickDelete = (event) => {
        event.stopPropagation()
    }
    return (
        <Accordion
            onChange={handleChange(id)}
            expanded={openRoom === id}
            TransitionProps={{unmountOnExit: true}}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon/>}
                aria-label="Expand"
                aria-controls="additional-actions1-content"
                id="additional-actions1-header"
            >
                <Box display="flex" width="100%" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">
                        {title}
                    </Typography>
                    <Button
                        onClick={handleClickRename}
                        startIcon={<RenameRoomIcon/>}
                    >
                        Rename
                    </Button>
                    <Button
                        onClick={handleClickDelete}
                        startIcon={<DeleteRoomIcon htmlColor={theme.palette.error.main}/>}
                    >
                        Delete
                    </Button>
                    <Typography variant="h6">
                        {memberCount}
                    </Typography>
                </Box>
            </AccordionSummary>
            <BreakoutRoomAccordionContent
                roomId={id}
                rtmClient={rtmClient}
                updateMemberCount={updateMemberCount}
            />
        </Accordion>
    )
}


const ManageBreakoutRoomsView = ({breakoutRooms, handleClose}) => {
    const classes = useStyles()
    const rtmClient = useSelector(state => state.rtmClient)
    const [memberCounts, setMemberCounts] = useState({});
    // console.log("-> memberCounts", memberCounts);
    const [openRoom, setOpenRoom] = useState(breakoutRooms[0].id);
    useEffect(() => {
        getAllMemberCounts()
    }, [breakoutRooms])

    // console.log("-> channelMemberCountObj in body", memberCounts);
    const getAllMemberCounts = async () => {
        const breakoutRoomIds = breakoutRooms.map(room => room.id)
        // console.log("-> breakoutRoomIds", breakoutRoomIds);
        const channelMemberCountObj = await rtmClient.getChannelMemberCount(breakoutRoomIds)
        // console.log("-> channelMemberCountObj in fn", channelMemberCountObj);
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
                    <BreakoutRoom updateMemberCount={updateMemberCount} rtmClient={rtmClient} index={index}
                                  openRoom={openRoom}
                                  handleOpenAccordion={handleOpenAccordion}
                                  key={room.id} memberCount={memberCounts[room.id]} breakoutRoom={room}/>
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