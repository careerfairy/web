import PropTypes from "prop-types"
import React, { Fragment, useCallback, useEffect, useState } from "react"
import { alpha } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { AppBar, Box, CircularProgress, Tabs } from "@mui/material"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import NewStreamModal from "./NewStreamModal"
import { useRouter } from "next/router"
import {
   prettyLocalizedDate,
   repositionElement,
} from "../../../../helperFunctions/HelperFunctions"
import Tab from "@mui/material/Tab"
import Header from "./Header"
import EventsTable from "./events-table/EventsTable"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { v4 as uuidv4 } from "uuid"
import * as actions from "store/actions"
import { useDispatch } from "react-redux"
import { StreamCreationProvider } from "../../../draftStreamForm/StreamForm/StreamCreationProvider"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"

const useStyles = makeStyles((theme) => ({
   containerRoot: {},
   streamCard: {},
   highlighted: {},
   appBar: {
      boxShadow: "none",
      background: "none",
      borderBottom: `1px solid ${alpha(theme.palette.text.secondary, 0.3)}`,
      top: 64,
   },
   tab: {
      fontWeight: 600,
   },
   indicator: {
      height: theme.spacing(0.8),
      padding: theme.spacing(0, 0.5),
   },
}))

const EventsOverview = () => {
   const { group } = useGroup()
   const classes = useStyles()
   const dispatch = useDispatch()
   const { userData, authenticatedUser } = useAuth()
   const {
      listenToDraftLiveStreamsByGroupId,
      listenToUpcomingLiveStreamsByGroupId,
      listenToPastLiveStreamsByGroupId,
      findTargetEvent,
      addLivestream,
      deleteLivestream,
      getAllGroupAdminInfo,
      sendNewlyPublishedEventEmail,
   } = useFirebaseService()
   const [streams, setStreams] = useState([])
   const [openNewStreamModal, setOpenNewStreamModal] = useState(false)
   const [tabValue, setTabValue] = useState("upcoming")
   const [fetching, setFetching] = useState(false)
   const [currentStream, setCurrentStream] = useState(null)
   const [fetchingQueryEvent, setFetchingQueryEvent] = useState(false)
   const [triggered, setTriggered] = useState(false)
   const [publishingDraft, setPublishingDraft] = useState(false)
   const [groupsDictionary, setGroupsDictionary] = useState({})

   const {
      query: { eventId },
      replace,
   } = useRouter()

   useEffect(() => {
      if (group?.id) {
         let query
         if (tabValue === "upcoming") {
            query = listenToUpcomingLiveStreamsByGroupId
         } else if (tabValue === "past") {
            query = listenToPastLiveStreamsByGroupId
         } else {
            query = listenToDraftLiveStreamsByGroupId
         }
         setFetching(true)
         const unsubscribe = query(group.id, (querySnapshot) => {
            if (
               tabValue === "upcoming" &&
               !querySnapshot.docs.length &&
               !triggered
            ) {
               setTabValue("past")
               setTriggered(true)
            }
            const streamsData = querySnapshot.docs.map((doc) => ({
               id: doc.id,
               rowId: doc.id,
               rowID: doc.id,
               date: doc.data().start?.toDate?.(),
               ...doc.data(),
            }))

            if (eventId) {
               const queryEventIndex = streamsData.findIndex(
                  (el) => el.id === eventId
               )
               if (queryEventIndex > -1) {
                  repositionElement(streamsData, queryEventIndex, 0)
               }
            }
            setStreams(streamsData)
            setFetching(false)
         })
         return () => unsubscribe()
      }
   }, [tabValue])

   useEffect(() => {
      if (eventId) {
         ;(async function getQueryEvent() {
            try {
               setFetchingQueryEvent(true)
               const { targetStream, typeOfStream } = await findTargetEvent(
                  eventId
               )
               if (typeOfStream && targetStream) {
                  setTabValue(typeOfStream)
               }
            } catch (e) {}
            setFetchingQueryEvent(false)
         })()
      }
   }, [eventId])

   const getAuthor = useCallback(
      (livestream) => {
         return livestream?.author?.email
            ? livestream.author
            : {
                 email: authenticatedUser.email,
                 ...(group?.id && { groupId: group.id }),
              }
      },
      [authenticatedUser.email, group.id]
   )

   const handlePublishStream = useCallback(
      async (streamObj, promotion) => {
         try {
            setPublishingDraft(true)
            const newStream = { ...streamObj }
            newStream.companyId = uuidv4()
            const author = getAuthor(newStream)
            const publishedStreamId = await addLivestream(
               newStream,
               "livestreams",
               author,
               promotion
            )
            newStream.id = publishedStreamId

            const submitTime = prettyLocalizedDate(new Date())
            const adminsInfo = await getAllGroupAdminInfo(
               newStream.groupIds || [],
               streamObj.id
            )

            const senderName = `${userData.firstName} ${userData.lastName}`

            await sendNewlyPublishedEventEmail({
               adminsInfo: adminsInfo || [],
               senderName,
               stream: newStream,
               submitTime,
            })
            await deleteLivestream(streamObj.id, "draftLivestreams")
            await replace(
               `/group/${group.id}/admin/events?eventId=${publishedStreamId}`
            )
         } catch (e) {
            setPublishingDraft(false)
            dispatch(actions.sendGeneralError(e))
         }
      },
      [
         getAuthor,
         addLivestream,
         getAllGroupAdminInfo,
         userData?.firstName,
         userData?.lastName,
         sendNewlyPublishedEventEmail,
         deleteLivestream,
         replace,
         group.id,
         dispatch,
      ]
   )

   const handleChange = (event, newValue) => {
      setTabValue(newValue)
   }

   const handleOpenNewStreamModal = () => {
      setOpenNewStreamModal(true)
   }

   const handleCloseNewStreamModal = () => {
      handleResetCurrentStream()
      setOpenNewStreamModal(false)
   }

   const handleResetCurrentStream = () => {
      setCurrentStream(null)
   }

   const handleEditStream = (streamObj) => {
      if (streamObj) {
         setCurrentStream(streamObj)
         handleOpenNewStreamModal()
      }
   }

   return (
      <Fragment>
         <AppBar className={classes.appBar} position="sticky" color="default">
            <Box>
               <Header
                  group={group}
                  handleOpenNewStreamModal={handleOpenNewStreamModal}
                  isDraft={tabValue === "draft"}
               />
            </Box>
            <Tabs
               value={tabValue}
               TabIndicatorProps={{ className: classes.indicator }}
               onChange={handleChange}
               indicatorColor="primary"
               textColor="primary"
               aria-label="full width tabs example"
            >
               <Tab className={classes.tab} label="Upcoming" value="upcoming" />
               <Tab className={classes.tab} label="Past" value="past" />
               <Tab className={classes.tab} label="Drafts" value="draft" />
            </Tabs>
         </AppBar>
         <Box className={classes.containerRoot} p={3}>
            {fetching ? (
               <Box
                  height={150}
                  width="100%"
                  alignItems="center"
                  justifyContent="center"
                  display="flex"
               >
                  <CircularProgress color="primary" />
               </Box>
            ) : (
               <EventsTable
                  handleEditStream={handleEditStream}
                  isDraft={tabValue === "draft"}
                  isPast={tabValue === "past"}
                  streams={streams}
                  handleOpenNewStreamModal={handleOpenNewStreamModal}
                  groupsDictionary={groupsDictionary}
                  group={group}
                  eventId={eventId}
                  setGroupsDictionary={setGroupsDictionary}
                  hasAccessToRegisteredStudents={
                     userData?.isAdmin &&
                     Boolean(
                        group?.universityCode || group?.privacyPolicyActive
                     )
                  }
                  handlePublishStream={handlePublishStream}
                  publishingDraft={publishingDraft}
                  disabled={fetchingQueryEvent || fetching}
               />
            )}
         </Box>
         <StreamCreationProvider>
            <NewStreamModal
               group={group}
               typeOfStream={tabValue}
               open={openNewStreamModal}
               handlePublishStream={handlePublishStream}
               handleResetCurrentStream={handleResetCurrentStream}
               currentStream={currentStream}
               onClose={handleCloseNewStreamModal}
            />
         </StreamCreationProvider>
      </Fragment>
   )
}

EventsOverview.propTypes = {
   group: PropTypes.object,
   isAdmin: PropTypes.bool,
}

export default EventsOverview
