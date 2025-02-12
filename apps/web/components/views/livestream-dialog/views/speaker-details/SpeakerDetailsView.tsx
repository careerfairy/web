import {
   Creator,
   mapSpeakerToCreator,
} from "@careerfairy/shared-lib/groups/creators"
import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import useGroup from "components/custom-hook/group/useGroup"
import { MentorDetailLayout } from "components/views/mentor-page/MentorDetailLayout"
import { useRouter } from "next/router"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import NotFoundView from "../common/NotFoundView"

import { Speaker } from "@careerfairy/shared-lib/livestreams"
import useCreatorPublicContent from "components/custom-hook/creator/useCreatorPublicContent"
import useTrackPageView from "components/custom-hook/useTrackDetailPageView"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { AnalyticsEvents } from "util/analytics/types"
import { dataLayerMentorEvent } from "util/analyticsUtils"
import useRegistrationHandler from "../../useRegistrationHandler"
import ActionButton from "../livestream-details/action-button/ActionButton"
import Speakers from "../livestream-details/main-content/Speakers"
import SpeakerDetailsViewSkeleton from "./SpeakerDetailsViewSkeleton"

const styles = sxStyles({
   livestreamCopy: {
      fontWeight: 700,
   },
   livestreamDateCopy: {
      fontWeight: 500,
   },
   copyStackContainer: {
      gap: "12px",
   },
   copyContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   heroContent: {
      padding: "10%",
      alignItems: "center",
      justifyContent: "center",
   },
   sectionTitle: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[800],
   },
   actionButtonWrapper: {
      display: "flex",
      justifyContent: "flex-end",
      width: "100%",
   },
})

type Props = {
   speaker: Speaker
}

const SpeakerDetailsView: FC = () => {
   const { query } = useRouter()
   const {
      speakerId: contextSpeakerId,
      mode,
      livestream,
   } = useLiveStreamDialog()

   const { livestreamDialog } = query

   const [, , , querySpeakerId] = livestreamDialog || []

   const speakerId = mode === "page" ? querySpeakerId : contextSpeakerId // If the mode is page, we need to use the query param

   if (!speakerId) return <SpeakerDetailsViewSkeleton />

   const speaker = livestream.speakers.find(
      (speaker) => speaker.id === speakerId
   )

   if (!speaker)
      return (
         <NotFoundView
            title="Speaker not found"
            description="The speaker you are looking for does not exist. It may have been deleted or closed or the link you followed may be broken."
         />
      )

   return (
      <SuspenseWithBoundary fallback={<SpeakerDetailsViewSkeleton />}>
         <SpeakerDetails speaker={speaker} />
      </SuspenseWithBoundary>
   )
}

const SpeakerDetails = ({ speaker }: Props) => {
   const { livestream, livestreamPresenter, goToView } = useLiveStreamDialog()
   const creator = mapSpeakerToCreator(speaker)

   //safeguard for backward compatibility, we can't track old speakers
   const isSpeakerCreator = livestreamPresenter.creatorsIds.includes(speaker.id)

   const { trackMentorPageView } = useFirebaseService()

   const viewRef = useTrackPageView({
      trackDocumentId: creator.groupId,
      handleTrack: ({ id, visitorId, extraData }) =>
         trackMentorPageView(id, extraData.creatorId, visitorId).then(() =>
            dataLayerMentorEvent(AnalyticsEvents.MentorPageVisit, creator)
         ),
      extraData: {
         creatorId: creator.id,
      },
   }) as unknown as React.RefObject<HTMLDivElement>

   const scrollToHero = () => {
      const element = document.getElementById("live-stream-dialog-hero")
      if (element) {
         element.parentElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "end",
         })
      }
   }

   const livestreamDetailSpeakerHeroContent = (
      <HeroContent
         backgroundImg={getResizedUrl(livestream.backgroundImageUrl, "lg")}
         onBackPosition={"top-left"}
         onBackClick={() => goToView("livestream-details")}
         noMinHeight
         sx={styles.heroContent}
      >
         <Box sx={styles.copyContainer}>
            <Stack sx={styles.copyStackContainer}>
               <Typography
                  align="center"
                  variant={"h4"}
                  sx={styles.livestreamCopy}
               >
                  Get to know your speakers!
               </Typography>
               <Typography
                  align="center"
                  variant={"body1"}
                  sx={styles.livestreamDateCopy}
               >
                  {livestreamPresenter.isPast()
                     ? `Live streamed on: ${DateUtil.getJobApplicationDate(
                          livestreamPresenter.start
                       )}`
                     : `${DateUtil.formatLiveDate(livestreamPresenter.start)}`}
               </Typography>
            </Stack>
         </Box>
      </HeroContent>
   )

   return (
      <SuspenseWithBoundary fallback={<SpeakerDetailsViewSkeleton />}>
         <BaseDialogView
            heroContent={livestreamDetailSpeakerHeroContent}
            mainContent={
               <MainContent>
                  <Box ref={isSpeakerCreator ? viewRef : null}>
                     <MentorDetails mentor={creator} />
                  </Box>
                  <Stack spacing={2}>
                     <Typography sx={styles.sectionTitle} variant="brandedH5">
                        Other speakers from this live stream
                     </Typography>
                     <Speakers
                        speakers={livestream.speakers.filter(
                           (speaker) => speaker.id != creator.id
                        )}
                        title={null}
                        onClick={scrollToHero}
                     />
                  </Stack>
               </MainContent>
            }
            fixedBottomContent={<LiveStreamButton />}
         />
      </SuspenseWithBoundary>
   )
}

const LiveStreamButton = () => {
   const { handleRegisterClick } = useRegistrationHandler()
   const { livestreamPresenter, serverUserEmail } = useLiveStreamDialog()

   return (
      <Box sx={styles.actionButtonWrapper}>
         <Box>
            <ActionButton
               livestreamPresenter={livestreamPresenter}
               onRegisterClick={handleRegisterClick}
               userEmailFromServer={serverUserEmail}
               isFixedToBottom
               canWatchRecording
            />
         </Box>
      </Box>
   )
}

const MentorDetails = ({ mentor }: { mentor: Creator }) => {
   const { data: group } = useGroup(mentor.groupId)
   const {
      data: { livestreams, sparks, hasJobs },
   } = useCreatorPublicContent(mentor)

   return (
      <Stack spacing={3} mb={3}>
         <MentorDetailLayout.Header mentor={mentor} group={group} fullWidth />
         <Stack spacing={2}>
            <Typography sx={styles.sectionTitle} variant="brandedH5">
               About the host
            </Typography>
            <MentorDetailLayout.Description
               mentor={mentor}
               group={group}
               hasJobs={hasJobs}
               numLivestreams={livestreams?.length}
               numSparks={sparks?.length}
            />
         </Stack>
         <MentorDetailLayout.Content
            livestreams={livestreams}
            sparks={sparks}
         />
      </Stack>
   )
}

export default SpeakerDetailsView
