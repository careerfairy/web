import { Speaker } from "@careerfairy/shared-lib/livestreams"
import { Box, Button, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { IAgoraRTCRemoteUser, useRemoteUsers } from "agora-rtc-react"
import { useLivestreamData } from "components/custom-hook/streaming"
import FramerBox from "components/views/common/FramerBox"
import { cfLogo } from "constants/images"
import { AnimatePresence, Variants } from "framer-motion"
import { ReactNode, useMemo, useState } from "react"
import { Edit2 } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { buildAgoraSpeakerId } from "../../util"
import { AddNewSpeakerButton } from "./AddNewSpeakerButton"
import { HostProfileButton } from "./HostProfileButton"
import { useHostProfileSelection } from "./HostProfileSelectionProvider"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   list: {
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
   editButton: {
      mt: 3,
   },
})

const containerAnimationVariants: Variants = {
   hidden: { opacity: 0 },
   visible: (hasSeenAnimation) => ({
      opacity: 1,
      transition: {
         staggerChildren: hasSeenAnimation ? 0 : 0.2,
      },
   }),
}

type SpeakersListProps = {
   hasSeenStaggerAnimation: boolean
}

export const SpeakersList = ({
   hasSeenStaggerAnimation,
}: SpeakersListProps) => {
   const { userData, isLoggedIn } = useAuth()
   const { selectSpeaker, joinLiveStreamWithUser, editSpeaker } =
      useHostProfileSelection()
   const livestream = useLivestreamData()
   const remoteUsers = useRemoteUsers()

   const [isEditMode, setIsEditMode] = useState(false)

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
      <Box sx={styles.root}>
         <Typography component="p" sx={styles.heading} variant="medium">
            Please select your profile:
         </Typography>
         <FramerBox
            custom={hasSeenStaggerAnimation}
            variants={containerAnimationVariants}
            sx={styles.list}
         >
            <AnimatePresence mode="sync">
               {Boolean(userData?.isAdmin) && (
                  <ItemAnimation key={userData.authId}>
                     <HostProfileButton
                        onClick={() => joinLiveStreamWithUser(userData.authId)}
                        speaker={{
                           avatar: cfLogo,
                           firstName: userData.firstName,
                           lastName: userData.lastName,
                           id: userData.id,
                        }}
                     />
                  </ItemAnimation>
               )}
               {speakers.map((speaker) => (
                  <ItemAnimation key={speaker.id}>
                     <HostProfileButton
                        onClick={() =>
                           isEditMode
                              ? editSpeaker(speaker)
                              : selectSpeaker(speaker)
                        }
                        speaker={speaker}
                        profileInUse={isSpeakerInUse(speaker, remoteUsers)}
                        isEditMode={isEditMode}
                     />
                  </ItemAnimation>
               ))}
               <ItemAnimation key="add-speaker">
                  <AddNewSpeakerButton />
               </ItemAnimation>
            </AnimatePresence>
         </FramerBox>
         {Boolean(isLoggedIn) && (
            <Button
               sx={styles.editButton}
               onClick={() => setIsEditMode((prev) => !prev)}
               color={isEditMode ? "primary" : "grey"}
               variant={isEditMode ? "contained" : "outlined"}
               endIcon={isEditMode ? null : <Edit2 />}
            >
               {isEditMode ? "Done" : "Edit"}
            </Button>
         )}
      </Box>
   )
}

const itemAnimationVariants = {
   hidden: { opacity: 0, scale: 0.9 },
   visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
   exit: { opacity: 0, scale: 0.9, transition: { duration: 0.5 } },
} satisfies Variants

const ItemAnimation = ({ children }: { children: ReactNode }) => {
   return (
      <FramerBox
         sx={styles.item}
         variants={itemAnimationVariants}
         initial={itemAnimationVariants.hidden}
         animate={itemAnimationVariants.visible}
         exit={itemAnimationVariants.exit}
      >
         {children}
      </FramerBox>
   )
}
