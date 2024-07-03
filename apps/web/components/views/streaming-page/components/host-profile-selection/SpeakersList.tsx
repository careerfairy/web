import { Speaker } from "@careerfairy/shared-lib/livestreams"
import { Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { IAgoraRTCRemoteUser, useRemoteUsers } from "agora-rtc-react"
import { useLivestreamData } from "components/custom-hook/streaming"
import FramerBox from "components/views/common/FramerBox"
import { cfLogo } from "constants/images"
import { STREAM_IDENTIFIERS } from "constants/streaming"
import { AnimatePresence, Variants } from "framer-motion"
import { Fragment, useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import { useHostProfileSelection } from "./HostProfileSelectionProvider"
import { SpeakerButton } from "./SpeakerButton"

const styles = sxStyles({
   root: {
      maxWidth: 706,
      display: "flex",
      gap: "24px",
      flexWrap: "wrap",
      justifyContent: "center",
   },
   item: {
      width: {
         xs: 96,
         sm: 116,
      },
      display: "flex",
      justifyContent: "center",
   },
   heading: {
      color: "neutral.700",
      mb: 2.5,
      textAlign: "center",
   },
})

const containerVariants: Variants = {
   hidden: { opacity: 0 },
   visible: {
      opacity: 1,
      transition: {
         staggerChildren: 0.2,
      },
   },
}

const itemVariants = {
   hidden: { opacity: 0, scale: 0.9 },
   visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
   exit: { opacity: 0, scale: 0.9, transition: { duration: 0.5 } },
} satisfies Variants

export const buildAgoraSpeakerId = (speakerId: string, streamId: string) => {
   return `${STREAM_IDENTIFIERS.SPEAKER}-${speakerId}-${streamId}` as const
}

export const SpeakersList = () => {
   const { userData } = useAuth()
   const { selectSpeaker, joinLiveStreamWithUser } = useHostProfileSelection()
   const livestream = useLivestreamData()
   const remoteUsers = useRemoteUsers()

   const speakers = useMemo(() => {
      return [
         ...(livestream?.speakers || []),
         ...(livestream?.adHocSpeakers || []),
      ]
   }, [livestream.speakers, livestream.adHocSpeakers])

   const isSpeakerInUse = (
      speaker: Speaker,
      remoteUsers: IAgoraRTCRemoteUser[]
   ) => {
      return remoteUsers.some(
         (user) => user.uid === buildAgoraSpeakerId(speaker.id, livestream.id)
      )
   }

   return (
      <Fragment>
         <Typography component="p" sx={styles.heading} variant="medium">
            Please select your profile:
         </Typography>
         <FramerBox variants={containerVariants} sx={styles.root}>
            <AnimatePresence>
               {Boolean(userData?.isAdmin) && (
                  <FramerBox sx={styles.item}>
                     <SpeakerButton
                        onClick={() => joinLiveStreamWithUser(userData.authId)}
                        speaker={{
                           avatar: cfLogo,
                           firstName: userData.firstName,
                           lastName: userData.lastName,
                           id: userData.id,
                        }}
                     />
                  </FramerBox>
               )}
               {speakers.map((speaker) => (
                  <FramerBox
                     key={speaker.id}
                     sx={styles.item}
                     variants={itemVariants}
                     initial={itemVariants.hidden}
                     animate={itemVariants.visible}
                     exit={itemVariants.exit}
                  >
                     <SpeakerButton
                        onClick={() => selectSpeaker(speaker)}
                        speaker={speaker}
                        greyedOut={isSpeakerInUse(speaker, remoteUsers)}
                     />
                  </FramerBox>
               ))}
            </AnimatePresence>
         </FramerBox>
      </Fragment>
   )
}
