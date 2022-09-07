import { useCurrentStream } from "context/stream/StreamContext"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import React, { useContext, useEffect, useState } from "react"
import useInfiniteScrollClient from "../../../../../../../components/custom-hook/useInfiniteScrollClient"
import { AccordionDetails } from "@mui/material"
import Box from "@mui/material/Box"
import EmptyRoomIcon from "@mui/icons-material/SentimentDissatisfied"
import Typography from "@mui/material/Typography"
import PropTypes from "prop-types"
import UserList from "./UserList"
import makeStyles from "@mui/styles/makeStyles"
import RTMContext from "context/agora/RtmContext"

const useStyles = makeStyles((theme) => ({
   listWrapper: {
      display: "flex",
      flexDirection: "column",
      height: "30vh",
      maxHeight: 200,
      minHeight: 75,
      width: "100%",
      overflowX: "hidden",
   },
   emptyRoomIcon: {
      marginRight: theme.spacing(1),
   },
}))

const BreakoutRoomAccordionContent = ({
   updateMemberCount,
   roomId,
   liveSpeakers,
   openRoom,
}) => {
   const { agoraHandlers } = useContext(RTMContext)

   const {
      currentLivestream: { id: livestreamId },
   } = useCurrentStream()
   const { getUsersByEmail } = useFirebaseService()
   const [channelMemberIds, setChannelMemberIds] = useState([])
   const [channelMembers, setChannelMembers] = useState([])
   const [rtmChannel, setRtmChannel] = useState(null)

   const [
      paginatedChannelMembers,
      getMorePaginatedChannelMembers,
      hasMorePaginatedChannelMembers,
   ] = useInfiniteScrollClient(channelMemberIds, 5)
   const [channelMemberDictionary, setChannelMemberDictionary] = useState({})
   const classes = useStyles()

   useEffect(() => {
      if (liveSpeakers?.length) {
         setChannelMemberDictionary((prevState) => {
            const newState = { ...prevState }
            liveSpeakers.forEach((speakerData) => {
               if (speakerData.speakerUuid) {
                  newState[speakerData.speakerUuid] =
                     getDisplayData(speakerData)
               }
            })
            return newState
         })
      }
   }, [liveSpeakers])

   useEffect(() => {
      ;(function setNewChannelMembers() {
         const newChannelMembers = paginatedChannelMembers
            .filter((memberId) => channelMemberDictionary[memberId])
            .map((memberId) => channelMemberDictionary[memberId])
         setChannelMembers(newChannelMembers)
      })()
   }, [channelMemberDictionary, paginatedChannelMembers])

   useEffect(() => {
      ;(async function fetchAndMapMemberData() {
         const membersToFetch = paginatedChannelMembers
            .filter((member) => !channelMemberDictionary[member])
            .map((member) => member.replace(roomId, ""))
            .filter((memberId) => memberId !== livestreamId)
         if (membersToFetch?.length) {
            const arrayOfUserObjects = await getUsersByEmail(membersToFetch, {
               withEmpty: true,
            })
            setChannelMemberDictionary((prevState) => {
               const newState = { ...prevState }
               arrayOfUserObjects.forEach((userObj) => {
                  newState[roomId + userObj.id] = getDisplayData(userObj)
               })
               return newState
            })
         }
      })()
   }, [paginatedChannelMembers])

   useEffect(() => {
      connectToChannel()
   }, [])

   useEffect(() => {
      return () => leaveChannel()
   }, [rtmChannel])
   useEffect(() => {
      getMemberCount()
   }, [roomId])

   const getDisplayData = (userInfo) => {
      const isVisitor = !userInfo.firstName && !userInfo.lastName
      return isVisitor
         ? {
              displayName: "Visitor",
              firstName: "Visitor",
              initials: "V",
           }
         : {
              displayName: `${userInfo.firstName || ""} ${
                 userInfo.lastName?.[0] || ""
              }`,
              firstName: userInfo.firstName || "",
              lastName: userInfo.lastName || "",
              speakerUuid: userInfo.speakerUuid,
              initials: `${userInfo.firstName?.[0] || ""} ${
                 userInfo.lastName?.[0] || ""
              }`,
           }
   }

   const handleMemberJoined = (joinerId) => {
      setChannelMemberIds((prevState) => [...new Set([...prevState, joinerId])])
   }

   const handleMemberLeft = (leaverId) => {
      setChannelMemberIds((prevState) =>
         prevState.filter((memberId) => memberId !== leaverId)
      )
   }

   const leaveChannel = async () => {
      if (rtmChannel) {
         await agoraHandlers.leaveChannel(rtmChannel)
         setRtmChannel(null)
      }
   }

   const connectToChannel = async () => {
      const newRtmChannel = await agoraHandlers.joinChannel(
         roomId,
         handleMemberJoined,
         handleMemberLeft,
         updateMemberCount
      )
      const members = await agoraHandlers.getChannelMembers(newRtmChannel)
      setRtmChannel(newRtmChannel)
      setChannelMemberIds(members)
   }

   const getMemberCount = async () => {
      const channelMemberCountObj = await agoraHandlers.getChannelMemberCount([
         roomId,
      ])
      const memberCount = channelMemberCountObj[roomId]
      updateMemberCount(roomId, memberCount - 1)
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
                  <EmptyRoomIcon className={classes.emptyRoomIcon} />
                  <Typography>Room is empty</Typography>
               </Box>
            )}
         </div>
      </AccordionDetails>
   )
}

BreakoutRoomAccordionContent.propTypes = {
   roomId: PropTypes.string.isRequired,
   liveSpeakers: PropTypes.array,
}

export default BreakoutRoomAccordionContent
