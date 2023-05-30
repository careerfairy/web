import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
   getServerSideStream,
   getServerSideUserStats,
   getUserTokenFromCookie,
} from "../../util/serverUtil"
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
import AboutSection from "../../components/views/upcoming-livestream/AboutSection"
import QuestionsSection from "../../components/views/upcoming-livestream/QuestionsSection"
import SpeakersSection from "../../components/views/upcoming-livestream/SpeakersSection"
import TalentPoolSection from "../../components/views/upcoming-livestream/TalentPoolSection"
import { useTheme } from "@mui/material/styles"
import ContactSection from "../../components/views/upcoming-livestream/ContactSection"
import Navigation from "../../components/views/upcoming-livestream/Navigation"
import { useMediaQuery } from "@mui/material"
import { languageCodesDict } from "../../components/helperFunctions/streamFormFunctions"
import { useInterests } from "../../components/custom-hook/useCollection"
import ReferralSection from "../../components/views/upcoming-livestream/ReferralSection"
import SEO from "../../components/util/SEO"
import EventSEOSchemaScriptTag from "../../components/views/common/EventSEOSchemaScriptTag"
import { dataLayerLivestreamEvent } from "../../util/analyticsUtils"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import FooterButton from "../../components/views/common/FooterButton"
import useTrackPageView from "../../components/custom-hook/useTrackDetailPageView"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { omit } from "lodash"
import { fromDate } from "data/firebase/FirebaseInstance"
import { recommendationServiceInstance } from "data/firebase/RecommendationService"
import { Group } from "@careerfairy/shared-lib/groups"
import { GetServerSidePropsContext } from "next"
import { UserStats } from "@careerfairy/shared-lib/users"
import useRecordingAccess from "components/views/upcoming-livestream/HeroSection/useRecordingAccess"
import useRegistrationData from "../../components/views/livestream-dialog/views/registration/useRegistrationData"
import LivestreamDialog from "../../components/views/livestream-dialog/LivestreamDialog"
import useDialogStateHandler from "../../components/custom-hook/useDialogStateHandler"

type TrackProps = {
   id: string
   visitorId: string
   extraData: LivestreamEvent
}

const UpcomingLivestreamPage = ({
   serverStream,
   userEmail,
   userStatsPlain,
}) => {
   const aboutRef = useRef(null)
   const speakersRef = useRef(null)
   const questionsRef = useRef(null)
   const { trackDetailPageView, deregisterFromLivestream } =
      useFirebaseService()

   const handleTrack = ({ id, visitorId, extraData: stream }: TrackProps) => {
      if (stream) {
         // increase event popularity
         recommendationServiceInstance.visitDetailPage(
            stream as LivestreamEvent,
            visitorId
         )
      }
      return trackDetailPageView(id, visitorId)
   }

   const viewRef = useTrackPageView({
      trackDocumentId: serverStream.id,
      extraData: serverStream,
      handleTrack,
   })

   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down("md"))

   const [stream, setStream] = useState(
      LivestreamPresenter.parseDocument(serverStream, fromDate)
   )

   const streamPresenter = useMemo(
      () => LivestreamPresenter.createFromDocument(stream),
      [stream]
   )

   const { filteredGroups, unfilteredGroups } = useRegistrationData(stream)

   const { push, asPath, query, pathname, replace } = useRouter()
   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()
   const { data: totalInterests } = useInterests()
   const [eventInterests, setEventInterests] = useState([])

   const { authenticatedUser, userData, userStats, isLoggedOut, isLoggedIn } =
      useAuth()

   useEffect(() => {
      handleOpenDialog()
   }, [handleOpenDialog])

   const updatedStats = useMemo(() => {
      return userStats ? userStats : userStatsPlain
   }, [userStatsPlain, userStats])

   const { showRecording, userHasBoughtRecording } = useRecordingAccess(
      userEmail,
      streamPresenter,
      updatedStats
   )

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

   const registered = useMemo(() => {
      return Boolean(
         authenticatedUser &&
            stream?.registeredUsers?.includes(authenticatedUser.email)
      )
   }, [stream, authenticatedUser])

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
            handleOpenDialog()
         }
      })()
   }, [
      handleOpenDialog,
      query?.register,
      stream?.id,
      stream?.hasStarted,
      unfilteredGroups,
      stream?.registeredUsers,
      authenticatedUser?.email,
      query,
      push,
      pathname,
   ])

   useEffect(() => {
      if (stream.hasStarted) {
         replace?.(`/streaming/${stream.id}/viewer`)
      }
   }, [replace, stream?.hasStarted, stream?.id])

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
            dateIsInUnder24Hours(stream?.start?.toDate?.())
      )
   }, [isPastEvent, stream?.isFaceToFace, stream?.start])

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
         dataLayerLivestreamEvent("event_registration_removed", stream)
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
               userHasBoughtRecording={userHasBoughtRecording}
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

            {!stream.hasNoTalentPool && (
               <TalentPoolSection
                  // @ts-ignore
                  handleOpenJoinModal={handleOpenJoinModal}
                  registered={registered}
                  stream={stream}
               />
            )}
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
               page={"register"}
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

   return omit(serverSideStream, [
      "talentPool",
      "participatingStudents",
      "participants",
      "liveSpeakers",
      "author",
   ])
}

export default UpcomingLivestreamPage
