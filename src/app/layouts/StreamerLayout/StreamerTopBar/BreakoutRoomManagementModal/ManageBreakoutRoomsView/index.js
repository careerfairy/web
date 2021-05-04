import React, {useCallback, useEffect, useState} from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    ListItem,
    ListItemAvatar,
    ListItemText
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
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";
import {useFirebase} from "../../../../../context/firebase";

const useStyles = makeStyles(theme => ({
    breakoutRoomsContent: {
        background: theme.palette.background.default
    },
    listWrapper: {
        display: "flex",
        flexDirection: "column",
        height: "30vh",
        minHeight: 200,
        width: "100%",
        overflowX: "hidden",
    }
}));

const ChannelMember = ({memberId, channelMemberDictionary, style}) => {

    return(
        <ListItem
            style={style}
            button
            alignItems="flex-start">
            <ListItemAvatar>
                <Avatar alt={"A G"}
                    // src={"avatarUrl"}
                >
                    {/*{firstName ? `${firstName[0] + lastName[0]}` : ""}*/}
                    A G
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                disableTypography
                primary={
                    <Typography
                        noWrap
                        variant="body1"
                    >
                        {/*{inTalentPool ? `${firstName} ${lastName}` : `${firstName} ${lastName?.[0]}`}*/}
                        A G
                    </Typography>
                }
            />
        </ListItem>
    )

}

const UserList = ({members, channelMemberDictionary}) => {

    return (
        <div style={{flex: '1 1 auto'}}>
            <AutoSizer>
                {({height, width}) => (
                    <FixedSizeList
                        itemSize={70}
                        itemCount={members.length} height={height} width={width}
                    >
                        {({style, index}) => <ChannelMember memberId={members[index]} style={style}/>}
                    </FixedSizeList>
                )}
            </AutoSizer>
        </div>
    );
};
const BreakoutRoomAccordionContent = ({updateMemberCount, roomId, rtmClient, liveSpeakers}) => {
    const {currentLivestream: {id: livestreamId}} = useCurrentStream()
    const {getUsersByIdsWithCache} = useFirebase()
    const [breakoutRoomChannel, setBreakoutRoomChannel] = useState(null);
    const [channelMembers, setChannelMembers] = useState([]);
    const [channelMemberDictionary, setChannelMemberDictionary] = useState({});
    // console.log("-> channelMemberDictionary", channelMemberDictionary);
    // console.log("-> channelMembers", channelMembers);
    // console.log("-> liveSpeakers", liveSpeakers);
    const rtmChannel = useSelector(state => state.rtmChannel)
    const classes = useStyles()

    useEffect(() => {
        if (liveSpeakers?.length) {
            setChannelMemberDictionary(prevState => {
                const newState = {...prevState}
                liveSpeakers.forEach(({speakerUuid, firstName, lastName}) => {
                    if (speakerUuid) {
                        newState[speakerUuid] = getDisplayName(firstName, lastName)
                    }
                })
                return newState
            })
        }
    }, [liveSpeakers])

    useEffect(() => {
        (async function fetchMemberData() {
            const membersToFetch = channelMembers.filter(member => !channelMemberDictionary[member]).map(member => member.replace(roomId, ''))
            const arrayOfUserObjects = await getUsersByIdsWithCache(membersToFetch)
            console.log("-> arrayOfUserObjects", arrayOfUserObjects);
        })()
    }, [channelMembers])

    useEffect(() => {
        if (rtmClient && !breakoutRoomChannel) {
            connectToChannel()
        }
        return () => leaveChannel()
    }, [Boolean(rtmClient), Boolean(breakoutRoomChannel)]);

    useEffect(() => {
        if (breakoutRoomChannel) {
            breakoutRoomChannel.on("MemberJoined", handleMemberJoined)
            breakoutRoomChannel.on("MemberLeft", handleMemberLeft)
            breakoutRoomChannel.on("MemberCountUpdated", newCount => {
                updateMemberCount(roomId, newCount)
            })
        }
    }, [Boolean(breakoutRoomChannel)])

    const getDisplayName = (firstName, lastName) => {
        return `${firstName} ${lastName?.[0]}`
    }

    const handleMemberJoined = (joinerId) => {
        setChannelMembers(prevState => [...prevState, joinerId])
    }

    const handleMemberLeft = (leaverId) => {
        setChannelMembers(prevState => prevState.filter(memberId => memberId !== leaverId))
    }

    useEffect(() => {
        getMemberCount()
    }, [roomId])

    const leaveChannel = () => {
        if (breakoutRoomChannel && (roomId !== livestreamId)) {
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
            <div className={classes.listWrapper}>
                <UserList
                    channelMemberDictionary={channelMemberDictionary}
                          members={channelMembers}
                />
            </div>
        </AccordionDetails>
    );
};

BreakoutRoomAccordionContent.propTypes = {
    roomId: PropTypes.string.isRequired,
    liveSpeakers: PropTypes.array
};
const BreakoutRoom = ({
                          breakoutRoom: {title, id, liveSpeakers},
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
                liveSpeakers={liveSpeakers}
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