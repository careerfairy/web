import {useCurrentStream} from "../../../../../../../context/stream/StreamContext";
import {useFirebase} from "../../../../../../../context/firebase";
import React, {useEffect, useState} from "react";
import useInfiniteScrollClient from "../../../../../../../components/custom-hook/useInfiniteScrollClient";
import {useSelector} from "react-redux";
import {AccordionDetails} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import EmptyRoomIcon from "@material-ui/icons/SentimentDissatisfied";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import UserList from "./UserList";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    listWrapper: {
        display: "flex",
        flexDirection: "column",
        // height: "30vh",
        maxHeight: 200,
        minHeight: 75,
        width: "100%",
        overflowX: "hidden",
    },
    emptyRoomIcon: {
        marginRight: theme.spacing(1)
    }
}));

const BreakoutRoomAccordionContent = ({updateMemberCount, roomId, rtmClient, liveSpeakers, openRoom}) => {
    const {currentLivestream: {id: livestreamId}} = useCurrentStream()
    const {getUsersByEmail} = useFirebase()
    const [breakoutRoomChannel, setBreakoutRoomChannel] = useState(null);
    const [channelMemberIds, setChannelMemberIds] = useState([]);
    const [channelMembers, setChannelMembers] = useState([]);

    const [
        paginatedChannelMembers,
        getMorePaginatedChannelMembers,
        hasMorePaginatedChannelMembers
    ] = useInfiniteScrollClient(channelMemberIds, 5)
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
            setChannelMembers(paginatedChannelMembers.filter(memberId => channelMemberDictionary[memberId]).map(memberId => channelMemberDictionary[memberId]))
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
                updateMemberCount(roomId, newCount -1)
            })
            return () => leaveChannel()
        }
    }, [Boolean(breakoutRoomChannel)])

    useEffect(() => {
        getMemberCount()
    }, [roomId])

    const getDisplayData = (userInfo) => {
        const isVisitor = !userInfo.firstName && !userInfo.lastName
        return isVisitor ? {
            displayName: "Visitor",
            firstName: "Visitor",
            initials: "V"
        } : {
            displayName: `${userInfo.firstName || ""} ${userInfo.lastName?.[0] || ""}`,
            firstName: userInfo.firstName || "",
            lastName: userInfo.lastName || "",
            speakerUuid: userInfo.speakerUuid,
            initials: `${userInfo.firstName?.[0] || ""} ${userInfo.lastName?.[0] || ""}`
        }
    }

    const handleMemberJoined = (joinerId) => {
        setChannelMemberIds(prevState => [...new Set([...prevState, joinerId])])
    }

    const handleMemberLeft = (leaverId) => {
        setChannelMemberIds(prevState => prevState.filter(memberId => memberId !== leaverId))
    }


    const leaveChannel = async () => {
        if (breakoutRoomChannel && (roomId !== livestreamId)) {
            try {
                breakoutRoomChannel.removeAllListeners()
                breakoutRoomChannel.leave()
            } catch (e) {
            }
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
        setChannelMemberIds(members)
        setBreakoutRoomChannel(channel)
    }

    const getMemberCount = async () => {
        const channelMemberCountObj = await rtmClient.getChannelMemberCount([roomId])
        const memberCount = channelMemberCountObj[roomId]
        updateMemberCount(roomId, memberCount -1)
    }
    return (
        <AccordionDetails>
            <div className={classes.listWrapper}>
                {channelMembers.length ? (
                    <UserList
                        hasMore={hasMorePaginatedChannelMembers}
                        loadMore={getMorePaginatedChannelMembers}
                        channelMemberDictionary={channelMemberDictionary}
                        members={channelMembers}
                    />
                ) : (
                    <Box display="flex" alignItems="center">
                        <EmptyRoomIcon className={classes.emptyRoomIcon}/>
                        <Typography>
                            Room is empty
                        </Typography>
                    </Box>
                )}
            </div>
        </AccordionDetails>
    );
};

BreakoutRoomAccordionContent.propTypes = {
    roomId: PropTypes.string.isRequired,
    liveSpeakers: PropTypes.array
};

export default BreakoutRoomAccordionContent