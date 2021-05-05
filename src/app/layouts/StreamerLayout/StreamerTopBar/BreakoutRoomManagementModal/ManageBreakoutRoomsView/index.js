import React, {useCallback, useEffect, useState} from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Button, CircularProgress,
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
import useInfiniteScrollClient from "../../../../../components/custom-hook/useInfiniteScrollClient";
import InfiniteLoader from "react-window-infinite-loader";

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

const ChannelMember = (
    {
        memberData,
        index,
        members,
        style
    }) => {

    const itemLoading = index === members.length;

    const content = itemLoading ? (
        <CircularProgress/>
    ) : (
        <React.Fragment>
            <ListItemAvatar>
                <Avatar alt={"A G"}
                        src={memberData.avatarUrl}
                >
                    {memberData.firstName ? `${memberData.firstName[0] + memberData.lastName[0]}` : ""}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                disableTypography
                primary={
                    <Typography
                        noWrap
                        variant="body1"
                    >
                        {memberData.displayName}
                    </Typography>
                }
                secondary={memberData.speakerUuid ? "Streamer" : "Viewer"}
            />
        </React.Fragment>
    )
    return (
        <ListItem
            style={style}
            button
            alignItems="flex-start">
            {content}
        </ListItem>
    )

}

const UserList = ({members, loadMore, hasMore}) => {
    const itemCount = hasMore ? members.length + 1 : members.length;
    return (
        <div style={{flex: '1 1 auto'}}>
            <InfiniteLoader
                isItemLoaded={index => index < members.length}
                itemCount={itemCount}
                loadMoreItems={loadMore}
            >
                {({onItemsRendered, ref}) => (
                    <AutoSizer>
                        {({height, width}) => (
                            <FixedSizeList
                                itemSize={70}
                                ref={ref}
                                onItemsRendered={onItemsRendered}
                                itemCount={itemCount}
                                height={height}
                                width={width}
                            >
                                {({style, index}) => <ChannelMember members={members} index={index}
                                                                    memberData={members[index]} style={style}/>}
                            </FixedSizeList>
                        )}
                    </AutoSizer>
                )}
            </InfiniteLoader>
        </div>
    );
};
const BreakoutRoomAccordionContent = ({updateMemberCount, roomId, rtmClient, liveSpeakers}) => {
    const {currentLivestream: {id: livestreamId}} = useCurrentStream()
    const {getUsersByEmail} = useFirebase()
    const [breakoutRoomChannel, setBreakoutRoomChannel] = useState(null);
    const [channelMembers, setChannelMembers] = useState([]);
    // console.log("-> channelMembers", channelMembers);
    const [
        paginatedChannelMembers,
        getMorePaginatedChannelMembers,
        hasMorePaginatedChannelMembers
    ] = useInfiniteScrollClient(channelMembers, 5)
    const [channelMemberDictionary, setChannelMemberDictionary] = useState({});
    const rtmChannel = useSelector(state => state.rtmChannel)
    const classes = useStyles()

    useEffect(() => {
        if (liveSpeakers?.length) {
            setChannelMemberDictionary(prevState => {
                const newState = {...prevState}
                liveSpeakers.forEach(speakerData => {
                    if (speakerData.speakerUuid) {
                        newState[speakerData.speakerUuid] = getDisplayData(speakerData)
                    }
                })
                return newState
            })
        }
    }, [liveSpeakers])

    useEffect(() => {
        (async function fetchMemberData() {
            const membersToFetch = paginatedChannelMembers.filter(member => !channelMemberDictionary[member]).map(member => member.replace(roomId, ''))
            if (membersToFetch?.length) {
                const arrayOfUserObjects = await getUsersByEmail(membersToFetch, {withEmpty: true})
                setChannelMemberDictionary(prevState => {
                    const newState = {...prevState}
                    arrayOfUserObjects.forEach(userObj => {
                        newState[roomId + userObj.id] = getDisplayData(userObj)
                    })
                    return newState
                })
            }
        })()
    }, [paginatedChannelMembers])

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

    const getDisplayData = (userInfo) => {
        return {
            displayName: `${userInfo.firstName} ${userInfo.lastName?.[0]}`,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            speakerUuid: userInfo.speakerUuid
        }
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
                    hasMore={hasMorePaginatedChannelMembers}
                    loadMore={getMorePaginatedChannelMembers}
                    channelMemberDictionary={channelMemberDictionary}
                    members={paginatedChannelMembers.filter(memberId => channelMemberDictionary[memberId]).map(memberId => channelMemberDictionary[memberId])}
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