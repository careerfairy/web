import React, {useEffect, useState} from "react";
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
const BreakoutRoom = ({breakoutRoom: {title, id}, index}) => {
    const theme = useTheme()
    const {currentLivestream: {id: livestreamId}} = useCurrentStream()
    const [breakoutRoomChannel, setBreakoutRoomChannel] = useState(null);
    const [memberCount, setMemberCount] = useState(0);
    const [channelMembers, setChannelMembers] = useState([]);
    const rtmClient = useSelector(state => state.rtmClient)
    const rtmChannel = useSelector(state => state.rtmChannel)

    useEffect(() => {
        if (rtmClient && !breakoutRoomChannel) {
            connectToChannel()
        }
        return () => leaveChannel()
    }, [Boolean(rtmClient), Boolean(breakoutRoomChannel)]);


    useEffect(() => {
        getMemberCount()
    }, [id])

    const leaveChannel = () => {
        if (breakoutRoomChannel) {
            breakoutRoomChannel.leave()
        }
    }

    const connectToChannel = async () => {
        let channel
        if (id === livestreamId) {
            channel = rtmChannel
        } else {
            channel = rtmClient.createChannel(id)
            await channel.join()
        }
        const members = await channel.getMembers() || []
        setChannelMembers(members)
        setBreakoutRoomChannel(channel)
    }

    const getMemberCount = async () => {
        const channelMemberCountObj = await rtmClient.getChannelMemberCount([id])
        const memberCount = channelMemberCountObj[id]
        setMemberCount(memberCount)
    }

    return (
        <Accordion defaultExpanded={index === 0}>
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
                        color=""
                        startIcon={<RenameRoomIcon/>}
                    >
                        Rename
                    </Button>
                    <Button
                        startIcon={<DeleteRoomIcon htmlColor={theme.palette.error.main}/>}
                    >
                        Delete
                    </Button>
                    <Typography variant="h6">
                        {channelMembers.length}
                    </Typography>
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                <Typography color="textSecondary">
                    The click event of the nested action will propagate up and expand the accordion unless
                    you explicitly stop it.
                </Typography>
            </AccordionDetails>
        </Accordion>
    )
}


const ManageBreakoutRoomsView = ({breakoutRooms, handleClose}) => {
    const classes = useStyles()

    return (
        <React.Fragment>
            <DialogTitle>
                Manage Breakout Rooms - {breakoutRooms.length}
            </DialogTitle>
            <DialogContent className={classes.breakoutRoomsContent} dividers>
                {breakoutRooms.map((room, index) => (
                    <BreakoutRoom index={index} key={room.id} breakoutRoom={room}/>
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