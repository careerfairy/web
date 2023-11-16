import { FC } from "react"
import { Speaker } from "@careerfairy/shared-lib/livestreams"
import { sxStyles } from "../../../../../../types/commonTypes"
import Box from "@mui/material/Box"
import SectionTitle from "./SectionTitle"
import Stack from "@mui/material/Stack"
import Image from "next/legacy/image"
import { Typography } from "@mui/material"
import { NICE_SCROLLBAR_STYLES } from "../../../../../../constants/layout"
import { speakerPlaceholder } from "../../../../../util/constants"
import Skeleton from "@mui/material/Skeleton"
import { getResizedUrl } from "../../../../../helperFunctions/HelperFunctions"
import HorizontalScroll from "../../../../common/HorizontalScroll"

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

interface Props {
   speakers?: Speaker[]
}

const Speakers: FC<Props> = ({ speakers }) => {
   if (!speakers) {
      return null
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
   speaker: Speaker
}

const SpeakerAvatar: FC<SpeakerAvatarProps> = ({ speaker }) => {
   const displayName = `${speaker.firstName ?? ""} ${speaker.lastName ?? ""}`

   return (
      <Stack spacing={0.75} direction="row" sx={styles.speakerAvatar}>
         <Box minWidth={56} minHeight={56}>
            <Image
               className="avatar"
               width={56}
               height={56}
               src={getResizedUrl(speaker.avatar, "lg") || speakerPlaceholder}
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

const SpeakerAvatarSkeleton: FC = () => {
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
               <Skeleton width={160} />
            </Typography>
            <Typography
               sx={styles.position}
               whiteSpace="nowrap"
               variant="body2"
            >
               <Skeleton width={100} />
            </Typography>
         </Stack>
      </Stack>
   )
}

export const SpeakersSkeleton: FC = () => {
   return (
      <Box sx={styles.root}>
         <SectionTitle>Speakers</SectionTitle>
         <Stack sx={styles.speakersWrapper} direction="row" spacing={3}>
            {Array.from({ length: 3 }).map((_, i) => (
               <SpeakerAvatarSkeleton key={i} />
            ))}
         </Stack>
      </Box>
   )
}

export default Speakers
