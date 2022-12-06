import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { getServerSideStream } from "../../util/serverUtil"
import { getStreamMetaInfo } from "../../util/SeoUtil"
import UpcomingLayout from "../../layouts/UpcomingLayout"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import {
   getBaseUrl,
   getResizedUrl,
} from "../../components/helperFunctions/HelperFunctions"
import HeroSection from "../../components/views/upcoming-livestream/HeroSection"
import { useAuth } from "../../HOCs/AuthProvider"
import { dateIsInUnder24Hours, streamIsOld } from "../../util/CommonUtil"
import UserUtil from "../../data/util/UserUtil"
import { useRouter } from "next/router"
import RegistrationModal from "../../components/views/common/registration-modal"
import AboutSection from "../../components/views/upcoming-livestream/AboutSection"
import QuestionsSection from "../../components/views/upcoming-livestream/QuestionsSection"
import useInfiniteScrollServer from "../../components/custom-hook/useInfiniteScrollServer"
import SpeakersSection from "../../components/views/upcoming-livestream/SpeakersSection"
import TalentPoolSection from "../../components/views/upcoming-livestream/TalentPoolSection"
import { useTheme } from "@mui/material/styles"
import ContactSection from "../../components/views/upcoming-livestream/ContactSection"
import Navigation from "../../components/views/upcoming-livestream/Navigation"
import { useMediaQuery } from "@mui/material"
import { languageCodesDict } from "../../components/helperFunctions/streamFormFunctions"
import { getRelevantHosts } from "../../util/streamUtil"
import { useInterests } from "../../components/custom-hook/useCollection"
import ReferralSection from "../../components/views/upcoming-livestream/ReferralSection"
import SEO from "../../components/util/SEO"
import EventSEOSchemaScriptTag from "../../components/views/common/EventSEOSchemaScriptTag"
import { dataLayerLivestreamEvent } from "../../util/analyticsUtils"
import { LivestreamPresenter } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"
import FooterButton from "../../components/views/common/FooterButton"

const UpcomingLivestreamPage = ({ serverStream }) => {
   const aboutRef = useRef(null)
   const speakersRef = useRef(null)
   const questionsRef = useRef(null)

   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down("md"))

   const [stream, setStream] = useState(
      LivestreamPresenter.parseDocument(serverStream)
   )
   const { push, asPath, query, pathname, replace } = useRouter()
   const [currentGroup, setCurrentGroup] = useState(null)
   const [joinGroupModalData, setJoinGroupModalData] = useState(undefined)
   const [filteredGroups, setFilteredGroups] = useState([])
   const [targetGroupId, setTargetGroupId] = useState("")
   const [questionSortType, setQuestionSortType] = useState("timestamp")
   const { data: totalInterests } = useInterests()
   const [eventInterests, setSetEventInterests] = useState([])

   const [unfilteredGroups, setUnfilteredGroups] = useState([])

   const { authenticatedUser, userData, isLoggedOut, isLoggedIn } = useAuth()

   const registered = useMemo(() => {
      if (
         authenticatedUser &&
         stream?.registeredUsers?.includes(authenticatedUser.email)
      ) {
         return true
      }

      return false
   }, [stream, authenticatedUser])

   const participated = useMemo(() => {
      if (
         authenticatedUser &&
         stream?.participatingStudents?.includes(authenticatedUser.email)
      ) {
         return true
      }

      return false
   }, [stream, authenticatedUser])

   const handleCloseJoinModal = useCallback(
      () => setJoinGroupModalData(undefined),
      []
   )
   const handleOpenJoinModal = useCallback(
      () =>
         setJoinGroupModalData({
            groups: unfilteredGroups,
            targetGroupId: targetGroupId,
            livestream: stream,
         }),
      [targetGroupId, stream, unfilteredGroups]
   )

   const [isPastEvent, setIsPastEvent] = useState(streamIsOld(stream?.start))

   const streamLanguage = languageCodesDict?.[stream?.language?.code]

   const {
      listenToScheduledLivestreamById,
      listenToCareerCenterById,
      getDetailLivestreamCareerCenters,
      livestreamQuestionsQuery,
      upvoteLivestreamQuestion,
      auth,
   } = useFirebaseService()

   const questionsQuery = useMemo(() => {
      // prevent an extra query for the questions if they are disabled
      if (stream?.questionsDisabled) {
         return null
      }

      return stream && livestreamQuestionsQuery(stream.id, questionSortType)
   }, [stream, livestreamQuestionsQuery, questionSortType])

   const handlers = useInfiniteScrollServer({
      limit: 8,
      query: questionsQuery,
   })

   useEffect(() => {
      if (totalInterests) {
         setSetEventInterests(
            totalInterests.filter((interest) =>
               stream?.interestsIds?.includes(interest.id)
            )
         )
      }
   }, [stream?.interestsIds, totalInterests])

   useEffect(() => {
      window.scrollTo(0, 0)
   }, [])

   useEffect(() => {
      setIsPastEvent(streamIsOld(stream?.start))
   }, [stream?.start])

   useEffect(() => {
      if (stream.id) {
         const unsubscribe = listenToScheduledLivestreamById(
            stream.id,
            (querySnapshot) => {
               if (querySnapshot.exists) {
                  const data = querySnapshot.data()
                  setStream({
                     ...data,
                     id: querySnapshot.id,
                  })
               }
            }
         )
         return () => unsubscribe()
      }
   }, [listenToScheduledLivestreamById, stream?.id])

   useEffect(() => {
      if (query.groupId) {
         const unsubscribe = listenToCareerCenterById(
            query.groupId,
            (querySnapshot) => {
               setCurrentGroup({
                  ...querySnapshot.data(),
                  id: querySnapshot.id,
               })
            }
         )
         return () => unsubscribe()
      }
   }, [listenToCareerCenterById, query.groupId])

   useEffect(() => {
      if (stream?.groupIds?.length) {
         getDetailLivestreamCareerCenters(stream.groupIds).then(
            (querySnapshot) => {
               const groupList = querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
               }))
               const filteredHosts = getRelevantHosts(
                  currentGroup?.groupId,
                  stream,
                  groupList
               )
               setTargetGroupId(
                  filteredHosts.length === 1 ? filteredHosts[0].id : ""
               )
               setFilteredGroups(filteredHosts)
               setUnfilteredGroups(groupList)
            }
         )
      }
   }, [
      stream?.groupIds,
      currentGroup?.groupId,
      stream,
      getDetailLivestreamCareerCenters,
   ])

   useEffect(() => {
      ;(async function handleAutoRegister() {
         if (stream?.registeredUsers?.includes(authenticatedUser.email)) {
            if (stream?.hasStarted) {
               return
            }
            const newQuery = { ...query }
            if (newQuery.register) {
               delete newQuery.register
               await push({
                  pathname,
                  query: {
                     ...newQuery,
                  },
               })
            }
         }
         if (
            query.register === stream?.id &&
            unfilteredGroups.length &&
            !stream?.registeredUsers?.includes(authenticatedUser.email)
         ) {
            handleOpenJoinModal()
         }
      })()
   }, [
      query?.register,
      stream?.id,
      stream?.hasStarted,
      unfilteredGroups,
      stream?.registeredUsers,
      authenticatedUser?.email,
      query,
      push,
      pathname,
      handleOpenJoinModal,
   ])

   useEffect(() => {
      if (stream.hasStarted) {
         replace?.(`/streaming/${stream.id}/viewer`)
      }
   }, [replace, stream?.hasStarted, stream?.id])

   const registerButtonLabel = useMemo(() => {
      if (participated && isPastEvent) return "You attended this event"

      if (isPastEvent) return "The event is over"

      if (registered) return "You're booked"

      if (
         stream.maxRegistrants &&
         stream.maxRegistrants > 0 &&
         stream.registeredUsers &&
         stream.maxRegistrants <= stream.registeredUsers.length
      ) {
         return "No spots left"
      }

      if (authenticatedUser) {
         return "Attend Event"
      }

      return "Join to attend"
   }, [
      participated,
      isPastEvent,
      registered,
      stream.maxRegistrants,
      stream.registeredUsers,
      authenticatedUser,
   ])

   const isRegistrationDisabled = useMemo(() => {
      if (isPastEvent) return true
      //User should always be able to cancel registration
      if (authenticatedUser && registered) return false
      //Disable registration if max number of registrants is reached
      if (stream.maxRegistrants && stream.maxRegistrants > 0) {
         return stream.registeredUsers
            ? stream.maxRegistrants <= stream.registeredUsers.length
            : false
      }
      return false
   }, [isPastEvent, stream, authenticatedUser, registered])

   const linkToStream = useMemo(() => {
      const url = new URL(getBaseUrl() + asPath)

      const cannotRegister = !isLoggedIn || !auth?.currentUser?.emailVerified

      if (cannotRegister) {
         url.searchParams.append("register", stream.id) // add the register param so that the user auto registers when they get redirected on log in/sign up
      }

      return url.toString()
   }, [asPath, isLoggedIn, auth?.currentUser?.emailVerified, stream.id])

   const numberOfSpotsRemaining = useMemo(() => {
      if (!stream.maxRegistrants) return 0
      else if (!stream.registeredUsers) return stream.maxRegistrants
      else {
         return stream.maxRegistrants - stream.registeredUsers.length
      }
   }, [stream?.maxRegistrants, stream?.registeredUsers])

   const streamAboutToStart = useMemo(() => {
      return Boolean(
         !isPastEvent &&
            !stream?.isFaceToFace &&
            dateIsInUnder24Hours(stream?.startDate)
      )
   }, [isPastEvent, stream?.isFaceToFace, stream?.startDate])

   const startRegistrationProcess = useCallback(
      async (fromFooterButton = false) => {
         dataLayerLivestreamEvent(
            `event_registration_started${
               fromFooterButton ? "_from_footer_button" : ""
            }`,
            stream
         )
         if (isLoggedOut || !auth?.currentUser?.emailVerified) {
            dataLayerLivestreamEvent(
               "event_registration_started_login_required",
               stream
            )
            return push(
               asPath
                  ? {
                       pathname: `/login`,
                       query: { absolutePath: linkToStream },
                    }
                  : "/signup"
            )
         }

         if (!userData || !UserUtil.userProfileIsComplete(userData)) {
            dataLayerLivestreamEvent(
               "event_registration_started_profile_incomplete",
               stream
            )
            return push({
               pathname: `/profile`,
               query: { absolutePath: asPath },
            })
         }

         handleOpenJoinModal()
      },
      [
         asPath,
         auth?.currentUser?.emailVerified,
         handleOpenJoinModal,
         isLoggedOut,
         linkToStream,
         push,
         stream,
         userData,
      ]
   )

   const handleRegisterClick = useCallback(() => {
      if (!registered) {
         return startRegistrationProcess()
      }
   }, [registered, startRegistrationProcess])

   const handleChangeQuestionSortType = useCallback((event, newSortType) => {
      if (newSortType !== null) {
         setQuestionSortType(newSortType)
      }
   }, [])

   const handleUpvote = useCallback(
      async (question) => {
         if (isLoggedOut) {
            return push({
               pathname: `/signup`,
               query: { absolutePath: asPath },
            })
         }
         try {
            await upvoteLivestreamQuestion(
               stream.id,
               question,
               authenticatedUser.email
            )

            handlers.handleClientUpdate(question.id, {
               votes: question.votes + 1 || 1,
               emailOfVoters: question.emailOfVoters?.concat(
                  authenticatedUser.email
               ) || [authenticatedUser.email],
            })
         } catch (e) {}
      },
      [
         asPath,
         authenticatedUser.email,
         handlers,
         isLoggedOut,
         push,
         stream.id,
         upvoteLivestreamQuestion,
      ]
   )

   function hasVoted(question) {
      if (!authenticatedUser || !question.emailOfVoters) {
         return false
      }
      return question.emailOfVoters.indexOf(authenticatedUser.email) > -1
   }

   const handleFooterAttendButtonClick = useCallback(async () => {
      await startRegistrationProcess(true)
   }, [startRegistrationProcess])

   return (
      <>
         <UpcomingLayout>
            <EventSEOSchemaScriptTag event={stream} />
            <SEO {...getStreamMetaInfo(stream)} />
            <HeroSection
               backgroundImage={getResizedUrl(stream.backgroundImageUrl, "lg")}
               stream={stream}
               eventInterests={eventInterests}
               streamAboutToStart={streamAboutToStart}
               registerButtonLabel={registerButtonLabel}
               disabled={isRegistrationDisabled}
               registered={registered}
               streamLanguage={streamLanguage}
               numberOfSpotsRemaining={numberOfSpotsRemaining}
               hosts={filteredGroups}
               onRegisterClick={handleRegisterClick}
            />
            <Navigation
               aboutRef={aboutRef}
               speakersRef={speakersRef}
               questionsRef={questionsRef}
            />
            {stream.summary && (
               <AboutSection
                  summary={stream.summary}
                  sectionRef={aboutRef}
                  sectionId="about"
                  title={`${stream.company}`}
                  forceReveal={mobile}
                  big
                  overheadText={"ABOUT"}
               />
            )}
            {!!stream?.speakers?.length && (
               <SpeakersSection
                  overheadText={"OUR SPEAKERS"}
                  sectionRef={speakersRef}
                  backgroundColor={theme.palette.common.white}
                  sectionId="speakers"
                  big
                  speakers={stream.speakers}
               />
            )}

            <QuestionsSection
               livestreamId={stream.id}
               title={
                  isPastEvent
                     ? "Questions that were asked"
                     : `Have any questions for the speakers?`
               }
               big
               handleChangeQuestionSortType={handleChangeQuestionSortType}
               getMore={handlers.getMore}
               loadingInitialQuestions={handlers.loadingInitial}
               hasVoted={hasVoted}
               sectionRef={questionsRef}
               isPastEvent={isPastEvent}
               sectionId="questions"
               hasMore={handlers.hasMore}
               reFetchQuestions={handlers.getInitialQuery}
               handleUpvote={handleUpvote}
               questions={handlers.docs}
               questionSortType={questionSortType}
               questionsAreDisabled={stream.questionsDisabled}
            />

            {!stream.hasNoTalentPool && (
               <TalentPoolSection
                  handleOpenJoinModal={handleOpenJoinModal}
                  registered={registered}
                  stream={stream}
               />
            )}
            <ReferralSection event={stream} />
            <ContactSection
               backgroundColor={theme.palette.common.white}
               subtitle={"Any problem or question ? We want to hear from you"}
            />
            <RegistrationModal
               open={Boolean(joinGroupModalData)}
               handleClose={handleCloseJoinModal}
               onFinish={handleCloseJoinModal}
               promptOtherEventsOnFinal
               livestream={joinGroupModalData?.livestream}
               groups={joinGroupModalData?.groups}
            />
         </UpcomingLayout>
         {mobile && !isRegistrationDisabled && !registered && (
            <FooterButton
               handleClick={handleFooterAttendButtonClick}
               buttonMessage={"Attend Event"}
            />
         )}
      </>
   )
}

export async function getServerSideProps({
   params: { livestreamId },
   query: { groupId },
}) {
   const serverStream = await getServerSideStream(livestreamId)

   if (!serverStream) {
      return {
         notFound: true,
      }
   }

   // TODO check if groupId is part of stream.groupIds
   return {
      props: { serverStream, groupId: groupId || null }, // will be passed to the page component as props
   }
}

export default UpcomingLivestreamPage
