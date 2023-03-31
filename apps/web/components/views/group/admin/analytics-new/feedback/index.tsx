import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
   GeneralPageProvider,
   useAnalyticsPageContext,
} from "../general/GeneralPageProvider"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import Feedback from "../../analytics/Feedback"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import useTimeFrames from "../../../../../custom-hook/useTimeFrames"
import { UserType } from "../../analytics"
import { useRouter } from "next/router"
import { getCorrectPollOptionData } from "../../../../../../data/util/PollUtil"
import { useFirebaseService } from "../../../../../../context/firebase/FirebaseServiceContext"
import GeneralSearchFilter from "../general/search-filter/GeneralSearchFilter"

const AnalyticsFeedbackPageContent = () => {
   return (
      <GeneralPageProvider>
         <MemoizedPageContent />
      </GeneralPageProvider>
   )
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

const PageContent = () => {
   const firebase = useFirebaseService()
   const { group } = useGroup()
   const { livestreamStats } = useAnalyticsPageContext()
   const { globalTimeFrames } = useTimeFrames()
   const {
      query: { subsection },
   } = useRouter()

   const breakdownRef = useRef(null)

   const [currentStream, setCurrentStream] = useState(null)
   const [showBar, setShowBar] = useState(true)
   const [userType, setUserType] = useState(userTypes[0])
   const [fetchingPolls, setFetchingPolls] = useState(false)
   const [fetchingQuestions, setFetchingQuestions] = useState(false)
   const [fetchingRatings, setFetchingRatings] = useState(false)

   const selectedSubsection = subsection ? parseInt(subsection as string) : 0
   const [streamDataType, setStreamDataType] = useState(
      streamDataTypes[selectedSubsection]
   )

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
                     options: getCorrectPollOptionData(data),
                  }
               })
               setCurrentStream((prevState) => ({ ...prevState, pollEntries }))
               setFetchingPolls(false)
            }
         )
         return () => unsubscribePolls()
      }
   }, [currentStream?.id, firebase])

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
   }, [currentStream?.id, firebase])

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
   }, [currentStream?.id, firebase])

   const getAverageRating = (voters) => {
      const ratingVotes = voters.filter((voter) => voter?.rating > 0)
      const total = ratingVotes?.reduce((acc, curr) => acc + curr.rating, 0)
      return total ? Number(total / ratingVotes.length).toFixed(2) : 0
   }

   const globalTimeFrame = useMemo(
      () => (group.universityCode ? globalTimeFrames[2] : globalTimeFrames[0]),
      [globalTimeFrames, group.universityCode]
   )

   const mappedEvents = useMemo<LivestreamEvent[]>(() => {
      return (
         livestreamStats?.map(
            (stream) =>
               ({
                  ...stream.livestream,
                  participatingStudents: Array(
                     stream.generalStats.numberOfParticipants
                  ),
                  registeredUsers: Array(
                     stream.generalStats.numberOfRegistrations
                  ),
                  talentPool: Array(
                     stream.generalStats.numberOfTalentPoolProfiles
                  ),
               } as LivestreamEvent)
         ) || []
      )
   }, [livestreamStats])

   const handleScrollToBreakdown = useCallback(() => {
      if (breakdownRef.current) {
         breakdownRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
         })
      }
   }, [])

   const handleToggleBar = useCallback(() => {
      setShowBar((prev) => !prev)
   }, [])

   const futureStreams = useMemo(
      () =>
         mappedEvents.filter((stream) => stream.start?.toDate() > new Date()),
      [mappedEvents]
   )
   const streamsFromTimeFrame = useMemo(
      () =>
         mappedEvents.filter((stream) => stream.start?.toDate() < new Date()),
      [mappedEvents]
   )

   const isLoading = useMemo(
      () => livestreamStats === undefined,
      [livestreamStats]
   )

   return (
      <Box py={2}>
         <Container maxWidth={false}>
            <Grid container spacing={spacing}>
               <Grid xs={12} item>
                  <GeneralSearchFilter order={"asc"} />
               </Grid>
               <Feedback
                  group={group}
                  globalTimeFrame={globalTimeFrame}
                  futureStreams={futureStreams}
                  loading={isLoading}
                  userType={userType}
                  setUserType={setUserType}
                  userTypes={userTypes}
                  streamDataTypes={streamDataTypes}
                  streamsFromTimeFrame={streamsFromTimeFrame}
                  fetchingPolls={fetchingPolls}
                  fetchingQuestions={fetchingQuestions}
                  fetchingRatings={fetchingRatings}
                  handleScrollToBreakdown={handleScrollToBreakdown}
                  breakdownRef={breakdownRef}
                  streamDataType={streamDataType}
                  setStreamDataType={setStreamDataType}
                  handleToggleBar={handleToggleBar}
                  currentStream={currentStream}
                  setCurrentStream={setCurrentStream}
                  showBar={showBar}
               />
            </Grid>
         </Container>
      </Box>
   )
}

const spacing = 3
const MemoizedPageContent = memo(PageContent)

export default AnalyticsFeedbackPageContent
