import React, {
   Fragment,
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import { v4 as uuid } from "uuid"
import SwipeableViews from "react-swipeable-views"
import General from "./General"
import { alpha, useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { SwipeablePanel } from "../../../../../materialUI/GlobalPanels/GlobalPanels"
import Audience from "./Audience"
import Title from "./Title"
import Feedback from "./Feedback"
import {
   isEmpty,
   isLoaded,
   ReduxFirestoreQuerySetting,
   useFirestore,
   useFirestoreConnect,
} from "react-redux-firebase"
import { useDispatch, useSelector } from "react-redux"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import * as actions from "../../../../../store/actions"
import { AppBar, Box, Tab, Tabs } from "@mui/material"
import { checkIfInTalentPool } from "../../../../../data/util/AnalyticsUtil"
import { createSelector } from "reselect"
import { getCorrectPollOptionData } from "../../../../../data/util/PollUtil"
import useTimeFrames from "../../../../custom-hook/useTimeFrames"
import useUserDataSet from "../../../../custom-hook/useUserDataSet"
import useUserDataSetDictionary from "../../../../custom-hook/useUserDataSetDictionary"
import StreamFilterModal from "./StreamFilterModal"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"
import { RootState } from "../../../../../store/"
import Sources from "./RegistrationSources"
import { useRouter } from "next/router"

const useStyles = makeStyles((theme) => ({
   indicator: {
      height: theme.spacing(0.8),
      padding: theme.spacing(0, 0.5),
   },
   tab: {
      fontWeight: 600,
   },
   appBar: {
      boxShadow: "none",
      borderBottom: `1px solid ${alpha(theme.palette.text.secondary, 0.3)}`,
      background: "transparent",
   },
   slide: {
      // background: `linear-gradient(45deg, ${theme.palette.primary.main} 45%, ${alpha(theme.palette.secondary.main, 1)} 75%)`
   },
}))

const now = new Date()

export interface UserType {
   /*
    *The array field that has all the user Emails
    */
   propertyName: "talentPool" | "registeredUsers" | "participatingStudents"
   /*
    * The UI name of the property for the dashboard
    */
   displayName: string
   /*
    * Once the users are fetched,
    * they will be stored as an array
    * of user objects on the livestream
    * document.
    * */
   propertyDataName:
      | "talentPoolData"
      | "registeredUsersData"
      | "participatingStudentsData"
}

const userTypes: UserType[] = [
   {
      propertyName: "talentPool",
      displayName: "Talent Pool",
      propertyDataName: "talentPoolData",
   },
   {
      propertyName: "registeredUsers",
      displayName: "Registered Users",
      propertyDataName: "registeredUsersData",
   },
   {
      propertyName: "participatingStudents",
      displayName: "Participating Users",
      propertyDataName: "participatingStudentsData",
   },
]

const streamDataTypes = [
   {
      propertyName: "questions",
      displayName: "Questions",
   },
   {
      propertyName: "pollEntries",
      displayName: "Polls",
   },
   {
      propertyName: "feedback",
      displayName: "Feedback",
   },
]

const streamsSelector = createSelector(
   (livestreams) => livestreams,
   (_, { userDataSetDictionary }) => userDataSetDictionary,
   (_, { streamsMounted }) => streamsMounted,
   (_, { setStreamsMounted }) => setStreamsMounted,
   (livestreams, userDataSetDictionary, streamsMounted, setStreamsMounted) => {
      let streams = []
      if (livestreams) {
         // @ts-ignore
         streams = livestreams.map((streamObj) => {
            const livestream = {
               ...streamObj,
               noOfParticipating: streamObj.participatingStudents?.length || 0,
               noOfRegistered: streamObj.registeredUsers?.length || 0,
               noOfTalentPool: streamObj.talentPool?.length || 0,
            }
            if (streamObj.hasNoTalentPool) {
               livestream.noOfTalentPool = 0
               livestream.talentPool = []
            }

            livestream.date = livestream.start?.toDate()
            for (const userType of userTypes) {
               if (
                  isLoaded(userDataSetDictionary) &&
                  !isEmpty(userDataSetDictionary)
               ) {
                  livestream[userType.propertyName] = livestream[
                     userType.propertyName
                  ]?.filter((userEmail) => userDataSetDictionary?.[userEmail])
               }
               livestream[userType.propertyDataName] = livestream[
                  userType.propertyName
               ]
                  ?.filter((userEmail) => userDataSetDictionary?.[userEmail])
                  ?.map((userEmail) => ({
                     ...userDataSetDictionary?.[userEmail],
                     isInTalentPool: checkIfInTalentPool(livestream, userEmail),
                  }))
            }
            return livestream
         })
         if (!streamsMounted) {
            // @ts-ignore
            setStreamsMounted(true)
         }
      }
      return streams
   }
)

export interface UserDataSet {
   id: string
   dataSet: "groupUniversityStudents" | "followers"
   displayName: string
   miscName: string
}

const AnalyticsOverview = () => {
   const { group } = useGroup()
   const userDataSets: UserDataSet[] = [
      {
         id: uuid(),
         dataSet: "groupUniversityStudents",
         displayName: `${group.universityName} students`,
         miscName: `Only ${group.universityName} students`,
      },
      {
         id: uuid(),
         dataSet: "followers",
         displayName: "Total engaged students",
         miscName: "Total engaged students",
      },
   ]

   if (!group.universityCode) {
      userDataSets.shift()
   }
   const firestore = useFirestore()
   const firebase = useFirebaseService()
   const { globalTimeFrames } = useTimeFrames()

   const dispatch = useDispatch()
   const classes = useStyles()
   const breakdownRef = useRef(null)
   const theme = useTheme()
   const {
      query: { section, subsection },
   } = useRouter()
   const [value, setValue] = useState(section ? parseInt(section as string) : 0)
   const { userData } = useAuth()
   const [globalTimeFrame, setGlobalTimeFrame] = useState(
      group.universityCode ? globalTimeFrames[2] : globalTimeFrames[0]
   )
   const [showBar, setShowBar] = useState(true)
   const [userType, setUserType] = useState(userTypes[0])
   const selectedSubsection = subsection ? parseInt(subsection as string) : 0
   const [streamDataType, setStreamDataType] = useState(
      streamDataTypes[selectedSubsection]
   )
   const [currentStream, setCurrentStream] = useState(null)
   const [fetchingQuestions, setFetchingQuestions] = useState(false)
   const [streamFilterModalOpen, setStreamFilterModalOpen] = useState(false)
   const [fetchingRatings, setFetchingRatings] = useState(false)
   const [fetchingPolls, setFetchingPolls] = useState(false)
   const [limitedUserTypes, setLimitedUserTypes] = useState(userTypes)
   const [currentUserDataSet, setCurrentUserDataSet] = useState(userDataSets[0])
   const [streamsMounted, setStreamsMounted] = useState(false)

   const query = useMemo<ReduxFirestoreQuerySetting>(
      () => ({
         collection: `livestreams`,
         where: [
            ["start", ">", new Date(globalTimeFrame.double)],
            ["groupIds", "array-contains", group.id],
            ["test", "==", false],
         ],
         orderBy: ["start", "asc"],
         storeAs: `livestreams of ${group.id}`,
      }),
      [globalTimeFrame.double, group.id]
   )

   useFirestoreConnect(query)

   const nonFilteredStreamsFromTimeFrameAndFuture = useSelector(
      (state: RootState) =>
         state.analyticsReducer.streams.fromTimeframeAndFuture
   )

   const hiddenStreamIds = useSelector(
      (state: RootState) => state.analyticsReducer.hiddenStreamIds
   )

   const uniStudents = useMemo(
      () => Boolean(currentUserDataSet.dataSet === "groupUniversityStudents"),
      [currentUserDataSet, group.id]
   )
   const userDataSetDictionary = useUserDataSetDictionary(currentUserDataSet)
   const userDataSet = useUserDataSet(currentUserDataSet)

   const livestreams = useSelector(({ firestore: { ordered } }: RootState) =>
      // @ts-ignore
      streamsSelector(ordered[`livestreams of ${group.groupId}`], {
         userDataSetDictionary,
         streamsMounted,
         setStreamsMounted,
      })
   )

   useEffect(() => {
      return () => {
         dispatch(actions.clearHiddenStreamIds())
      }
   }, [])

   useEffect(() => {
      return () => setStreamsMounted(false)
   }, [])

   useEffect(() => {
      if (group.universityCode) {
         ;(async function getStudents() {
            try {
               await firestore.get({
                  collection: "userData",
                  where: [["university.code", "==", group.universityCode]],
                  // where: [["university.code", "==", group.universityCode], ["groupIds", "array-contains", group.id]],
                  storeAs: "groupUniversityStudents",
               })
            } catch (e) {
               console.log("-> e in getting student", e)
            }
         })()
      }
   }, [group?.universityCode])

   const handleSetUserdataSet = async () => {
      dispatch(actions.setUserDataSet(firebase.getUsersByEmail))
   }

   const handleFilterUserdataSet = async () => {
      dispatch(actions.setFilteredUserDataSet())
   }

   useEffect(() => {
      if (currentUserDataSet.dataSet === "followers" && !userData?.isAdmin) {
         let limitedUserTypes = [...userTypes]
         const policyActive = Boolean(group?.privacyPolicyActive)
         if (!policyActive) {
            limitedUserTypes = limitedUserTypes.filter(
               ({ propertyName }) => propertyName !== "participatingStudents"
            )
            limitedUserTypes = limitedUserTypes.filter(
               ({ propertyName }) => propertyName !== "registeredUsers"
            )
         }
         setLimitedUserTypes(limitedUserTypes)
      } else {
         setLimitedUserTypes(userTypes)
      }
   }, [currentUserDataSet.dataSet, userData, group?.privacyPolicyActive])

   useEffect(() => {
      if (currentStream?.id) {
         setFetchingPolls(true)
         const unsubscribePolls = firebase.listenToPollEntries(
            currentStream.id,
            (querySnapshot) => {
               const pollEntries = querySnapshot.docs.map((doc) => {
                  const data = doc.data()
                  return {
                     ...data,
                     id: doc.id,
                     date: data.timestamp?.toDate(),
                     // votes: data.voters?.length || 0,
                     options: getCorrectPollOptionData(data),
                  }
               })
               setCurrentStream((prevState) => ({ ...prevState, pollEntries }))
               setFetchingPolls(false)
            }
         )
         return () => unsubscribePolls()
      }
   }, [currentStream?.id])

   useEffect(() => {
      if (currentStream?.id) {
         setFetchingQuestions(true)
         const unsubscribeQuestions = firebase.listenToLivestreamQuestions(
            currentStream.id,
            (querySnapshot) => {
               const questions = querySnapshot.docs.map((doc) => {
                  const questionData = doc.data()
                  return {
                     id: doc.id,
                     ...questionData,
                     date: questionData.timestamp?.toDate(),
                  }
               })
               setCurrentStream((prevState) => ({ ...prevState, questions }))
               setFetchingQuestions(false)
            }
         )
         return () => unsubscribeQuestions()
      }
   }, [currentStream?.id])

   useEffect(() => {
      if (currentStream?.id) {
         const unsubscribeRatings = firebase.listenToLivestreamRatings(
            currentStream.id,
            async (querySnapshot) => {
               const feedback = []
               for (const ratingDoc of querySnapshot.docs) {
                  const ratingData = ratingDoc.data()
                  ratingData.id = ratingDoc.id
                  const votersSnap = await firebase.getLivestreamRatingVoters(
                     ratingDoc.id,
                     currentStream.id
                  )
                  const voters = votersSnap.docs.map((doc) => ({
                     id: doc.id,
                     date: doc.data().timestamp.toDate(),
                     ...doc.data(),
                  }))
                  const average = getAverageRating(voters)
                  feedback.push({
                     ...ratingData,
                     voters,
                     votes: voters.length,
                     average: Number(average),
                  })
               }
               setCurrentStream((prevState) => ({ ...prevState, feedback }))
               setFetchingRatings(false)
            }
         )

         return () => unsubscribeRatings()
      }
   }, [currentStream?.id])

   const handleChange = (event, newValue) => {
      setValue(newValue)
   }

   const handleChangeIndex = (index) => {
      setValue(index)
   }

   const getFutureEvents = () => {
      return livestreams.filter((stream) => {
         if (stream.start?.toDate() > now && isVisible(stream)) {
            return stream
         }
      })
   }

   const handleScrollToBreakdown = useCallback(() => {
      if (breakdownRef.current) {
         breakdownRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
         })
      }
   }, [breakdownRef.current])

   const getAverageRating = (voters) => {
      const ratingVotes = voters.filter((voter) => voter?.rating > 0)
      const total = ratingVotes?.reduce((acc, curr) => acc + curr.rating, 0)
      return total ? Number(total / ratingVotes.length).toFixed(2) : 0
   }

   const getStreamsFromTimeFrame = (timeframe) => {
      const targetTime = new Date(timeframe)
      return livestreams.filter((stream) => {
         const streamStart = stream.start?.toDate()
         return (
            streamStart > targetTime && streamStart < now && isVisible(stream)
         )
      })
   }

   const clearHiddenStreams = () => dispatch(actions.clearHiddenStreamIds())

   const handleCloseStreamFilterModal = () => {
      setStreamFilterModalOpen(false)
   }
   const handleOpenStreamFilterModal = () => {
      setStreamFilterModalOpen(true)
   }

   const isVisible = (stream) => {
      return Boolean(!hiddenStreamIds?.[stream.id])
   }

   const getStreamsFromBeforeTimeFrame = () => {
      return livestreams.filter((stream) => {
         const streamStart = stream.start?.toDate()
         return streamStart < globalTimeFrame.globalDate && isVisible(stream)
      })
   }

   const handleToggleBar = useCallback(() => {
      setShowBar((prev) => !prev)
   }, [])

   const handleReset = useCallback(() => {
      setCurrentStream(null)
      setUserType(userTypes[0])
   }, [])

   useEffect(() => {
      return () => {
         dispatch(actions.clearStreamsFromTimeframeAndFuture())
      }
   }, [])

   const streamsFromBeforeTimeFrame = useMemo(
      () => getStreamsFromBeforeTimeFrame(),
      [livestreams, hiddenStreamIds]
   )

   const futureStreams = useMemo(
      () => getFutureEvents(),
      [livestreams, hiddenStreamIds]
   )

   const streamsFromTimeFrame = useMemo(
      () => getStreamsFromTimeFrame(globalTimeFrame.globalDate),
      [livestreams, hiddenStreamIds]
   )

   const streamsFromTimeFrameAndFuture = useMemo(
      () => [...streamsFromTimeFrame, ...futureStreams],
      [streamsFromTimeFrame, futureStreams]
   )
   const isFollowers = useMemo(
      () => currentUserDataSet.dataSet === "followers",
      [currentUserDataSet]
   )

   useEffect(() => {
      const targetTime = new Date(globalTimeFrame.globalDate)
      const nonFilteredStreamsFromTimeFrameAndFuture = livestreams.filter(
         (stream) => {
            const streamStart = stream.start?.toDate()
            return streamStart > targetTime
         }
      )
      dispatch(
         actions.setStreamsFromTimeframeAndFuture(
            nonFilteredStreamsFromTimeFrameAndFuture
         )
      )
   }, [livestreams, globalTimeFrame.globalDate])

   useEffect(() => {
      if (
         streamsMounted &&
         !uniStudents &&
         (!userDataSetDictionary || !userDataSet)
      ) {
         ;(async function getTotalEngagedUsers() {
            try {
               await handleSetUserdataSet()
            } catch (e) {
               console.log("-> e in getting followers", e)
            }
         })()
      }
   }, [streamsMounted, uniStudents])

   useEffect(() => {
      if (currentUserDataSet.dataSet === "groupUniversityStudents") return
      ;(async function getTotalFilteredEngagedUsers() {
         try {
            await handleFilterUserdataSet()
         } catch (e) {
            console.log("-> e in setting filtered followers", e)
         }
      })()
   }, [
      hiddenStreamIds,
      nonFilteredStreamsFromTimeFrameAndFuture,
      userDataSetDictionary,
   ])

   const selectVisibleStreams = (arrayOfNewVisibleStreamIds) => {
      dispatch(actions.selectVisibleStreams(arrayOfNewVisibleStreamIds))
   }

   const getTabProps = (tabName) => ({
      group,
      futureStreams,
      globalTimeFrame,
      loading: !isLoaded(livestreams) || !isLoaded(userDataSet),
      streamsFromTimeFrame,
      showBar,
      handleToggleBar,
      breakdownRef,
      handleScrollToBreakdown,
      currentStream,
      setCurrentStream,
      userType,
      userTypes,
      setUserType,
      ...(tabName !== "feedback" && {
         streamsFromTimeFrameAndFuture,
         handleReset,
      }),
      ...(tabName === "feedback" && {
         streamDataTypes,
         fetchingRatings,
         fetchingQuestions,
         fetchingPolls,
         streamDataType,
         setStreamDataType,
      }),
      ...(tabName === "audience" && {
         isFollowers,
         limitedUserTypes,
         currentUserDataSet,
      }),
      ...(tabName === "general" && {
         streamsFromBeforeTimeFrame,
         currentUserDataSet,
      }),
      ...(tabName === "sources" && {
         streamsFromBeforeTimeFrame,
      }),
   })

   return (
      <Fragment>
         <AppBar className={classes.appBar} position="static" color="default">
            <Box>
               <Title
                  setGlobalTimeFrame={setGlobalTimeFrame}
                  userDataSets={userDataSets}
                  clearHiddenStreams={clearHiddenStreams}
                  streamsMounted={streamsMounted}
                  setStreamsMounted={setStreamsMounted}
                  currentUserDataSet={currentUserDataSet}
                  setCurrentUserDataSet={setCurrentUserDataSet}
                  globalTimeFrames={globalTimeFrames}
                  group={group}
                  globalTimeFrame={globalTimeFrame}
                  handleOpenStreamFilterModal={handleOpenStreamFilterModal}
                  streamFilterModalOpen={streamFilterModalOpen}
               />
            </Box>
            <Tabs
               value={value}
               TabIndicatorProps={{ className: classes.indicator }}
               onChange={handleChange}
               indicatorColor="primary"
               textColor="primary"
               aria-label="full width tabs example"
            >
               <Tab className={classes.tab} label="General" />
               <Tab className={classes.tab} label="Audience" />
               <Tab className={classes.tab} label="Feedback" />
               <Tab className={classes.tab} label="Registration Sources" />
            </Tabs>
         </AppBar>
         <SwipeableViews
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={value}
            slideClassName={classes.slide}
            disabled
            onChangeIndex={handleChangeIndex}
         >
            <SwipeablePanel value={value} index={0} dir={theme.direction}>
               <General {...getTabProps("general")} />
            </SwipeablePanel>
            <SwipeablePanel value={value} index={1} dir={theme.direction}>
               <Audience {...getTabProps("audience")} />
            </SwipeablePanel>
            <SwipeablePanel value={value} index={2} dir={theme.direction}>
               <Feedback {...getTabProps("feedback")} />
            </SwipeablePanel>
            <SwipeablePanel value={value} index={3} dir={theme.direction}>
               <Sources {...getTabProps("sources")} />
            </SwipeablePanel>
         </SwipeableViews>
         {streamFilterModalOpen && (
            <StreamFilterModal
               hiddenStreamIds={hiddenStreamIds}
               selectVisibleStreams={selectVisibleStreams}
               onClose={handleCloseStreamFilterModal}
               clearHiddenStreams={clearHiddenStreams}
               timeFrameName={globalTimeFrame.name}
               open={streamFilterModalOpen}
            />
         )}
      </Fragment>
   )
}

export default AnalyticsOverview
