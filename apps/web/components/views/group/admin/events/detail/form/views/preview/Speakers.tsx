import { sxStyles } from "@careerfairy/shared-ui"
import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
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
   speakerWrapper: (theme) => ({
      padding: 1.5,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "8px",
      border: `1px solid ${theme.palette.secondary[50]}`,
      background: theme.brand.white[200],
      mb: 0.5,
      "& .avatar": {
         borderRadius: "70px",
         minWidth: "48px !important",
         minHeight: "48px !important",
         border: `1.5px solid ${theme.brand.white[400]} !important`,
      },
   }),
   speakerNameWrapper: {
      justifyContent: "center",
      alignItems: "flex-start",
      gap: 0.5,
      userSelect: "none",
   },
   displayName: {
      fontWeight: 600,
   },
   position: {
      color: (theme) => theme.palette.neutral[500],
      lineHeight: "20px",
   },
   speakersWrapper: {
      overflowX: "auto",
      flexWrap: "nowrap",
      display: "flex",
      flexDirection: "row",
      gap: 1,
   },
})

type SpeakersProps = {
   speakers?: LivestreamFormSpeaker[]
}

const Speakers = ({ speakers }: SpeakersProps) => {
   if (!speakers || speakers.length === 0) {
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
      <Stack spacing={1} direction="row" sx={styles.speakerWrapper}>
         <Box minWidth={48} minHeight={48}>
            <Image
               className="avatar"
               width={48}
               height={48}
               src={
                  getResizedUrl(speaker.avatarUrl, "lg") || speakerPlaceholder
               }
               objectFit="cover"
               alt={displayName}
            />
         </Box>
         <Stack sx={styles.speakerNameWrapper}>
            <Typography
               sx={styles.displayName}
               whiteSpace="nowrap"
               variant="brandedBody"
            >
               {displayName}
            </Typography>
            <Typography
               sx={styles.position}
               whiteSpace="nowrap"
               variant="small"
            >
               {speaker.position}
            </Typography>
         </Stack>
      </Stack>
   )
}

const SpeakerAvatarSkeleton = () => {
   return (
      <Stack spacing={1} direction="row" sx={styles.speakerWrapper}>
         <Box minWidth={48} minHeight={48}>
            <Image
               className="avatar"
               width={48}
               height={48}
               src={speakerPlaceholder}
               objectFit="cover"
               alt={"Speaker Placeholder"}
            />
         </Box>
         <Stack>
            <Typography
               sx={styles.displayName}
               whiteSpace="nowrap"
               variant="brandedBody"
            >
               <StaticSkeleton width={160} />
            </Typography>
            <Typography
               sx={styles.position}
               whiteSpace="nowrap"
               variant="small"
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
