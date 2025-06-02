/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-handler-names */
import { AppBar, Box, CircularProgress, Tabs } from "@mui/material"
import Tab from "@mui/material/Tab"
import { alpha } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useRouter } from "next/router"
import PropTypes from "prop-types"
import { Fragment, useEffect, useState } from "react"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"
import { repositionElement } from "../../../../helperFunctions/HelperFunctions"
import Header from "./Header"
import EventsTable from "./events-table/EventsTable"
import { useLivestreamRouting } from "./useLivestreamRouting"

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
   const { group, livestreamDialog } = useGroup()

   const { createDraftLivestream } = useLivestreamRouting()

   const classes = useStyles()
   const {
      listenToDraftLiveStreamsByGroupId,
      listenToUpcomingLiveStreamsByGroupId,
      listenToPastLiveStreamsByGroupId,
      findTargetEvent,
   } = useFirebaseService()
   const [streams, setStreams] = useState([])
   const [tabValue, setTabValue] = useState("upcoming")
   const [fetching, setFetching] = useState(false)
   const [fetchingQueryEvent, setFetchingQueryEvent] = useState(false)
   const [triggered, setTriggered] = useState(false)
   const [groupsDictionary, setGroupsDictionary] = useState({})

   const {
      query: { eventId },
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
               isDraft: tabValue === "draft",
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
         // eslint-disable-next-line no-extra-semi
         ;(async function getQueryEvent() {
            try {
               setFetchingQueryEvent(true)
               const { targetStream, typeOfStream } = await findTargetEvent(
                  eventId
               )
               if (typeOfStream && targetStream) {
                  setTabValue(typeOfStream)
               }
            } catch (e) {
               /* empty */
            }
            setFetchingQueryEvent(false)
         })()
      }
   }, [eventId])

   const handleChange = (event, newValue) => {
      setTabValue(newValue)
   }

   return (
      <Fragment>
         <AppBar className={classes.appBar} position="sticky" color="default">
            <Box>
               <Header
                  group={group}
                  handleOpenNewStreamModal={createDraftLivestream}
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
                  isDraft={tabValue === "draft"}
                  isPast={tabValue === "past"}
                  streams={streams}
                  groupsDictionary={groupsDictionary}
                  group={group}
                  eventId={eventId}
                  setGroupsDictionary={setGroupsDictionary}
                  handlePublishStream={livestreamDialog.handlePublishStream}
                  publishingDraft={livestreamDialog.isPublishing}
                  disabled={fetchingQueryEvent || fetching}
               />
            )}
         </Box>
      </Fragment>
   )
}

EventsOverview.propTypes = {
   group: PropTypes.object,
   isAdmin: PropTypes.bool,
}

export default EventsOverview
