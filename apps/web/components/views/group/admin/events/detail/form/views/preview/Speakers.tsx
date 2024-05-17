import { sxStyles } from "@careerfairy/shared-ui"
import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import { speakerPlaceholder } from "components/util/constants"
import HorizontalScroll from "components/views/common/HorizontalScroll"
import SectionTitle from "components/views/livestream-dialog/views/livestream-details/main-content/SectionTitle"
import { NICE_SCROLLBAR_STYLES } from "constants/layout"
import Image from "next/legacy/image"
import { LivestreamFormSpeaker } from "../../types"
import StaticSkeleton from "./StaticSkeleton"

const styles = sxStyles({
   root: {
      ...NICE_SCROLLBAR_STYLES,
   },
   speakerAvatar: {
      "& .avatar": {
         borderRadius: "50%",
         minWidth: "56px !important",
         minHeight: "56px !important",
      },
   },
   displayName: {
      fontSize: "1.14rem",
   },
   position: {
      color: "text.secondary",
      fontSize: "1rem",
   },
   speakersWrapper: {
      overflowX: "auto",
      flexWrap: "nowrap",
      display: "flex",
      flexDirection: "row",
      "& > *": {
         "&:not(:last-child)": {
            mr: 3,
         },
      },
   },
})

type SpeakersProps = {
   speakers?: LivestreamFormSpeaker[]
}

const Speakers = ({ speakers }: SpeakersProps) => {
   if (!speakers) {
      return <SpeakersSkeleton />
   }

   return (
      <Box sx={styles.root}>
         <SectionTitle>Speakers</SectionTitle>
         <HorizontalScroll sx={styles.speakersWrapper}>
            {speakers.map((speaker) => (
               <SpeakerAvatar key={speaker.id} speaker={speaker} />
            ))}
         </HorizontalScroll>
      </Box>
   )
}

type SpeakerAvatarProps = {
   speaker: LivestreamFormSpeaker
}

const SpeakerAvatar = ({ speaker }: SpeakerAvatarProps) => {
   const displayName = `${speaker.firstName ?? ""} ${speaker.lastName ?? ""}`

   return (
      <Stack spacing={0.75} direction="row" sx={styles.speakerAvatar}>
         <Box minWidth={56} minHeight={56}>
            <Image
               className="avatar"
               width={56}
               height={56}
               src={speaker.avatarUrl}
               objectFit="cover"
               alt={displayName}
            />
         </Box>
         <Stack>
            <Typography
               sx={styles.displayName}
               whiteSpace="nowrap"
               variant="h6"
            >
               {displayName}
            </Typography>
            <Typography
               sx={styles.position}
               whiteSpace="nowrap"
               variant="body2"
            >
               {speaker.position}
            </Typography>
         </Stack>
      </Stack>
   )
}

const SpeakerAvatarSkeleton = () => {
   return (
      <Stack spacing={0.75} direction="row" sx={styles.speakerAvatar}>
         <Box minWidth={56} minHeight={56}>
            <Image
               className="avatar"
               width={56}
               height={56}
               src={speakerPlaceholder}
               objectFit="cover"
               alt={"Speaker Placeholder"}
            />
         </Box>
         <Stack>
            <Typography
               sx={styles.displayName}
               whiteSpace="nowrap"
               variant="h6"
            >
               <StaticSkeleton width={160} />
            </Typography>
            <Typography
               sx={styles.position}
               whiteSpace="nowrap"
               variant="body2"
            >
               <StaticSkeleton width={100} />
            </Typography>
         </Stack>
      </Stack>
   )
}

const SpeakersSkeleton = () => {
   return (
      <Box sx={styles.root}>
         <SectionTitle>Speakers</SectionTitle>
         <Stack sx={styles.speakersWrapper} direction="row" spacing={3}>
            <SpeakerAvatarSkeleton />
            <SpeakerAvatarSkeleton />
            <SpeakerAvatarSkeleton />
         </Stack>
      </Box>
   )
}

export default Speakers
