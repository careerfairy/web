import { Speaker } from "@careerfairy/shared-lib/livestreams/livestreams"
import {
   Avatar,
   avatarClasses,
   AvatarGroup,
   Box,
   Typography,
} from "@mui/material"
import Image from "next/image"
import { sxStyles } from "types/commonTypes"
import { BrandedTooltip } from "../../../../streaming-page/components/BrandedTooltip"

const AVATAR_SIZE = 36

const styles = sxStyles({
   avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      border: "none",
      backgroundColor: "transparent",
   },
   avatarGroup: {
      [`& .${avatarClasses.root}`]: {
         width: AVATAR_SIZE,
         height: AVATAR_SIZE,
         border: "none",
         backgroundColor: "transparent",
      },
   },
   surplusText: {
      color: (theme) => theme.brand.white[100],
      textAlign: "center",
      fontSize: "14px",
      fontWeight: 500,
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
   },
   overlay: {
      position: "absolute",
      background:
         "linear-gradient(0deg, rgba(47, 63, 61, 0.40) 0%, rgba(47, 63, 61, 0.40) 100%)",
      inset: 0,
   },
   surplusContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   surplusAvatar: {
      objectFit: "cover",
      borderRadius: "50%",
   },
   avatarImage: {
      objectFit: "cover",
   },
   tooltipWrapper: {
      display: "inline-flex",
   },
})

type Props = {
   speakers: Speaker[]
   maxVisible?: number
}

export const SpeakerAvatars = ({ speakers, maxVisible = 3 }: Props) => {
   if (!speakers || speakers.length === 0) {
      return (
         <Avatar sx={styles.avatar}>
            <Image
               src="/illustrations/user.png"
               alt="Default user"
               width={AVATAR_SIZE}
               height={AVATAR_SIZE}
               style={styles.avatarImage}
            />
         </Avatar>
      )
   }

   const renderSurplus = (surplus: number) => {
      const nextSpeaker = speakers[maxVisible - 1] // Get the first hidden speaker
      return (
         <Box sx={styles.surplusContainer}>
            {/* overlay */}
            <Box sx={styles.overlay} />
            <Image
               src={nextSpeaker?.avatar || "/illustrations/user.png"}
               alt={`${nextSpeaker?.firstName} ${nextSpeaker?.lastName} and ${surplus} more`}
               width={AVATAR_SIZE}
               height={AVATAR_SIZE}
               style={styles.surplusAvatar}
            />
            <Typography color="background.paper" sx={styles.surplusText}>
               +{surplus}
            </Typography>
         </Box>
      )
   }

   const avatarGroup = (
      <AvatarGroup
         max={maxVisible}
         sx={styles.avatarGroup}
         spacing={14}
         renderSurplus={renderSurplus}
      >
         {speakers.map((speaker) => (
            <Avatar
               key={speaker.id}
               alt={`${speaker.firstName} ${speaker.lastName}`}
            >
               {speaker.avatar ? (
                  <Image
                     src={speaker.avatar}
                     alt={`${speaker.firstName} ${speaker.lastName}`}
                     width={AVATAR_SIZE}
                     height={AVATAR_SIZE}
                     style={styles.avatarImage}
                  />
               ) : speaker.firstName && speaker.lastName ? (
                  `${speaker.firstName[0]}${speaker.lastName[0]}`
               ) : (
                  "?"
               )}
            </Avatar>
         ))}
      </AvatarGroup>
   )

   return (
      <BrandedTooltip
         title={`Speaker${speakers.length > 1 ? "s" : ""}`}
         placement="top"
         arrow
         wrapperStyles={styles.tooltipWrapper}
         offset={[0, -5]}
      >
         {avatarGroup}
      </BrandedTooltip>
   )
}
