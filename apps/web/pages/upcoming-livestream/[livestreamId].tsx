import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { UserStats } from "@careerfairy/shared-lib/users"
import { useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useLivestreamUsersCount } from "components/custom-hook/live-stream/useLivestreamUsersCount"
import { useUserIsRegistered } from "components/custom-hook/live-stream/useUserIsRegistered"
import useRecordingAccess from "components/views/upcoming-livestream/HeroSection/useRecordingAccess"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { fromDate } from "data/firebase/FirebaseInstance"
import { recommendationServiceInstance } from "data/firebase/RecommendationService"
import { omit } from "lodash"
import { GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnalyticsEvents } from "util/analyticsConstants"
import { useAuth } from "../../HOCs/AuthProvider"
import useRedirectToEventRoom from "../../components/custom-hook/live-stream/useRedirectToEventRoom"
import useTrackLivestreamView from "../../components/custom-hook/live-stream/useTrackLivestreamView"
import { useInterests } from "../../components/custom-hook/useCollection"
import useDialogStateHandler from "../../components/custom-hook/useDialogStateHandler"
import {
   getBaseUrl,
   getResizedUrl,
} from "../../components/helperFunctions/HelperFunctions"
import { languageCodesDict } from "../../components/helperFunctions/streamFormFunctions"
import SEO from "../../components/util/SEO"
import EventSEOSchemaScriptTag from "../../components/views/common/EventSEOSchemaScriptTag"
import FooterButton from "../../components/views/common/FooterButton"
import LivestreamDialog from "../../components/views/livestream-dialog/LivestreamDialog"
import useRegistrationData from "../../components/views/livestream-dialog/views/registration/useRegistrationData"
import AboutSection from "../../components/views/upcoming-livestream/AboutSection"
import ContactSection from "../../components/views/upcoming-livestream/ContactSection"
import HeroSection from "../../components/views/upcoming-livestream/HeroSection"
import Navigation from "../../components/views/upcoming-livestream/Navigation"
import QuestionsSection from "../../components/views/upcoming-livestream/QuestionsSection"
import ReferralSection from "../../components/views/upcoming-livestream/ReferralSection"
import SpeakersSection from "../../components/views/upcoming-livestream/SpeakersSection"
import UserUtil from "../../data/util/UserUtil"
import UpcomingLayout from "../../layouts/UpcomingLayout"
import { dateIsInUnder24Hours, streamIsOld } from "../../util/CommonUtil"
import { getStreamMetaInfo } from "../../util/SeoUtil"
import { dataLayerLivestreamEvent } from "../../util/analyticsUtils"
import {
   getServerSideStream,
   getServerSideUserStats,
   getUserTokenFromCookie,
} from "../../util/serverUtil"

const UpcomingLivestreamPage = ({
   serverStream,
   userEmail,
   userStatsPlain,
}) => {
   const aboutRef = useRef(null)
   const speakersRef = useRef(null)
   const questionsRef = useRef(null)
   const { deregisterFromLivestream } = useFirebaseService()

   const viewRef = useTrackLivestreamView(serverStream)

   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down("md"))

   const [stream, setStream] = useState(
      LivestreamPresenter.parseDocument(serverStream, fromDate)
   )
   const streamId = stream.id || serverStream.id
   const { count: registeredUsersCount } = useLivestreamUsersCount(
      streamId,
      "registered"
   )
   const registered = useUserIsRegistered(streamId)

   const streamPresenter = useMemo(
      () => LivestreamPresenter.createFromDocument(stream),
      [stream]
   )

   const { filteredGroups, unfilteredGroups } = useRegistrationData(stream)

   const { push, asPath, query, pathname } = useRouter()
   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()
   const { data: totalInterests } = useInterests()
   const [eventInterests, setEventInterests] = useState([])

   const { authenticatedUser, userData, userStats, isLoggedOut, isLoggedIn } =
      useAuth()

   const updatedStats = useMemo(() => {
      return userStats ? userStats : userStatsPlain
   }, [userStatsPlain, userStats])

   const { showRecording } = useRecordingAccess(userEmail, streamPresenter)

   const companyGroupData = useMemo<Group | null>(() => {
      const companyGroups = unfilteredGroups?.filter(
         (group) => !group.universityCode
      )

      const isSingleCompany = companyGroups?.length === 1

      if (isSingleCompany) {
         return companyGroups[0]
      }

      return null
   }, [unfilteredGroups])

   const [isPastEvent, setIsPastEvent] = useState(streamIsOld(stream?.start))

   const streamLanguage = languageCodesDict?.[stream?.language?.code]

   const { listenToScheduledLivestreamById, auth } = useFirebaseService()

   useEffect(() => {
      if (totalInterests) {
         setEventInterests(
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
      async function handleAutoRegister() {
         if (registered) {
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
            !registered
         ) {
            handleOpenDialog()
         }
      }
      handleAutoRegister()
   }, [
      handleOpenDialog,
      query?.register,
      stream?.id,
      stream?.hasStarted,
      unfilteredGroups,
      registered,
      authenticatedUser?.email,
      query,
      push,
      pathname,
   ])

   useRedirectToEventRoom(streamPresenter)

   const isRegistrationDisabled = useMemo(() => {
      if (isPastEvent) return true
      //User should always be able to cancel registration
      if (authenticatedUser && registered) return false
      //Disable registration if max number of registrants is reached
      if (stream.maxRegistrants && stream.maxRegistrants > 0) {
         return registeredUsersCount
            ? stream.maxRegistrants <= registeredUsersCount
            : false
      }
      return false
   }, [
      isPastEvent,
      stream,
      authenticatedUser,
      registered,
      registeredUsersCount,
   ])

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
      else if (!registeredUsersCount) return stream.maxRegistrants
      else {
         return stream.maxRegistrants - registeredUsersCount
      }
   }, [stream?.maxRegistrants, registeredUsersCount])

   const streamAboutToStart = useMemo(() => {
      return Boolean(
         !isPastEvent &&
            !stream?.isFaceToFace &&
            dateIsInUnder24Hours(stream?.start?.toDate?.())
      )
   }, [isPastEvent, stream?.isFaceToFace, stream?.start])

   const startRegistrationProcess = useCallback(
      async (fromFooterButton = false) => {
         const eventName = fromFooterButton
            ? AnalyticsEvents.EventRegistrationStartedFromFooterButton
            : AnalyticsEvents.EventRegistrationStarted

         dataLayerLivestreamEvent(eventName, stream)
         if (isLoggedOut || !auth?.currentUser?.emailVerified) {
            dataLayerLivestreamEvent(
               AnalyticsEvents.EventRegistrationStartedLoginRequired,
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
               AnalyticsEvents.EventRegistrationStartedProfileIncomplete,
               stream
            )
            return push({
               pathname: `/profile`,
               query: { absolutePath: asPath },
            })
         }

         handleOpenDialog()
      },
      [
         asPath,
         auth?.currentUser?.emailVerified,
         handleOpenDialog,
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
      } else {
         recommendationServiceInstance.unRegisterEvent(
            stream.id,
            userData.authId
         )
         dataLayerLivestreamEvent(
            AnalyticsEvents.EventRegistrationRemoved,
            stream
         )
         return deregisterFromLivestream(stream?.id, userData)
      }
   }, [
      deregisterFromLivestream,
      registered,
      startRegistrationProcess,
      stream,
      userData,
   ])

   const handleFooterAttendButtonClick = useCallback(async () => {
      await startRegistrationProcess(true)
   }, [startRegistrationProcess])

   return (
      <>
         <UpcomingLayout viewRef={viewRef}>
            <EventSEOSchemaScriptTag event={stream} />
            <SEO {...getStreamMetaInfo(stream)} />
            <HeroSection
               backgroundImage={getResizedUrl(stream.backgroundImageUrl, "lg")}
               stream={stream}
               streamPresenter={streamPresenter}
               eventInterests={eventInterests}
               streamAboutToStart={streamAboutToStart}
               streamLanguage={streamLanguage}
               numberOfSpotsRemaining={numberOfSpotsRemaining}
               hosts={filteredGroups}
               onRegisterClick={handleRegisterClick}
               showScrollButton={true}
               isPastEvent={isPastEvent}
               showRecording={showRecording}
               userEmailFromServer={userEmail}
            />
            <Navigation
               aboutRef={aboutRef}
               speakersRef={speakersRef}
               questionsRef={questionsRef}
            />
            {stream.summary || stream.reasonsToJoinLivestream ? (
               <AboutSection
                  summary={stream.summary}
                  reasonsToJoinLivestream={stream.reasonsToJoinLivestream}
                  sectionRef={aboutRef}
                  sectionId="about"
                  title={`${stream.company}`}
                  forceReveal={mobile}
                  big
                  overheadText={"ABOUT"}
                  companyGroupData={companyGroupData}
               />
            ) : null}
            {!!stream?.speakers?.length && (
               <SpeakersSection
                  // @ts-ignore
                  overheadText={"OUR SPEAKERS"}
                  sectionRef={speakersRef}
                  backgroundColor={theme.palette.common.white}
                  sectionId="speakers"
                  big
                  speakers={stream.speakers}
               />
            )}

            <QuestionsSection
               livestream={stream}
               title={
                  isPastEvent
                     ? "Questions that were asked"
                     : `Have any questions for the speakers?`
               }
               big
               sectionRef={questionsRef}
               isPastEvent={isPastEvent}
               sectionId="questions"
               questionsAreDisabled={stream.questionsDisabled}
            />

            {/*{!stream.hasNoTalentPool && (*/}
            {/*   <TalentPoolSection*/}
            {/*      // @ts-ignore*/}
            {/*      handleOpenJoinModal={handleOpenJoinModal}*/}
            {/*      registered={registered}*/}
            {/*      stream={stream}*/}
            {/*   />*/}
            {/*)}*/}
            <ReferralSection
               // @ts-ignore
               event={stream}
            />
            <ContactSection
               backgroundColor={theme.palette.common.white}
               subtitle={"Any problem or question ? We want to hear from you"}
            />
            <LivestreamDialog
               open={isDialogOpen}
               updatedStats={updatedStats}
               serverUserEmail={userEmail}
               serverSideLivestream={stream}
               livestreamId={stream.id}
               handleClose={handleCloseDialog}
               initialPage={"register"}
               mode="stand-alone"
            />
         </UpcomingLayout>
         {mobile && !isRegistrationDisabled && !registered ? (
            <FooterButton
               handleClick={handleFooterAttendButtonClick}
               buttonMessage={"Attend Event"}
            />
         ) : null}
      </>
   )
}

export async function getServerSideProps({
   params: { livestreamId },
   query: { groupId },
   req,
}: GetServerSidePropsContext) {
   const token = getUserTokenFromCookie({ req })

   const serverStream = await getServerSideStream(livestreamId as string)

   if (serverStream) {
      let userStats: UserStats = null
      if (token?.email) {
         userStats = await getServerSideUserStats(token.email)
      }

      return {
         props: {
            serverStream: serializeLivestream(serverStream),
            groupId: groupId || null,
            // allows the client side to know in the first render if the user
            // has bought access to the recording or not
            userStatsPlain: userStats || null,
            // improve UX by allowing the client side to know beforehand the
            // user was signed in before fetching the firestore auth data
            userEmail: token?.email ?? null,
         }, // will be passed to the page component as props
      }
   } else {
      return {
         notFound: true,
      }
   }
}

const serializeLivestream = (stream: LivestreamEvent): object => {
   const serverSideStream = LivestreamPresenter.serializeDocument(stream)

   return omit(serverSideStream, ["liveSpeakers", "author"])
}

export default UpcomingLivestreamPage
