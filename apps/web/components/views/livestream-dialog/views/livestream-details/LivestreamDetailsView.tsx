import { FC } from "react"
import BaseDialogView, { HeroContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import Stack from "@mui/material/Stack"
import CountDownTimer, { CountdownTimerSkeleton } from "./CountDownTimer"
import LivestreamTagsContainer from "./LivestreamTagsContainer"
import HostInfo, { HostInfoSkeleton } from "./HostInfo"
import LivestreamTitle, { LivestreamTitleSkeleton } from "./LivestreamTitle"
import RegisterComponent from "./RegisterComponent"
import useRecordingAccess from "../../../upcoming-livestream/HeroSection/useRecordingAccess"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import RecordingPlayer from "./RecordingPlayer"

const LivestreamDetailsView: FC = () => {
   const { livestream, livestreamPresenter, updatedStats, serverUserEmail } =
      useLiveStreamDialog()
   const { authenticatedUser } = useAuth()

   const { showRecording, userHasBoughtRecording } = useRecordingAccess(
      authenticatedUser.email || serverUserEmail,
      livestreamPresenter,
      updatedStats
   )

   if (!livestream) return <LivestreamDetailsViewSkeleton />
   // return <LivestreamDetailsViewSkeleton />

   return (
      <BaseDialogView
         heroContent={
            <HeroContent
               backgroundImg={getResizedUrl(
                  livestream.backgroundImageUrl,
                  "lg"
               )}
            >
               <Stack alignItems="center" justifyContent={"center"} spacing={2}>
                  <HostInfo presenter={livestreamPresenter} />
                  <LivestreamTitle text={livestream.title} />
                  <LivestreamTagsContainer presenter={livestreamPresenter} />
                  {showRecording ? (
                     <RecordingPlayer
                        stream={livestream}
                        livestreamPresenter={livestreamPresenter}
                        boughtAccess={userHasBoughtRecording}
                     />
                  ) : (
                     <>
                        <CountDownTimer presenter={livestreamPresenter} />
                        <RegisterComponent
                           livestreamPresenter={livestreamPresenter}
                           onRegisterClick={() => {}}
                        />
                     </>
                  )}
               </Stack>
            </HeroContent>
         }
      />
   )
}

const LivestreamDetailsViewSkeleton = () => {
   return (
      <BaseDialogView
         heroContent={
            <HeroContent>
               <Stack alignItems="center" justifyContent={"center"} spacing={2}>
                  <HostInfoSkeleton />
                  <LivestreamTitleSkeleton />
                  <CountdownTimerSkeleton />
               </Stack>
            </HeroContent>
         }
      />
   )
}

export default LivestreamDetailsView
