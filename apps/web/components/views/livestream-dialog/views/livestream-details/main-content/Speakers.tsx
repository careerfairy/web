import { Speaker } from "@careerfairy/shared-lib/livestreams"
import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import { useLiveStreamDialog } from "components/views/livestream-dialog/LivestreamDialog"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import Image from "next/legacy/image"
import { FC } from "react"
import { NICE_SCROLLBAR_STYLES } from "../../../../../../constants/layout"
import { sxStyles } from "../../../../../../types/commonTypes"
import { getResizedUrl } from "../../../../../helperFunctions/HelperFunctions"
import { speakerPlaceholder } from "../../../../../util/constants"
import HorizontalScroll from "../../../../common/HorizontalScroll"
import SectionTitle from "./SectionTitle"

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
      ":hover": {
         borderColor: theme.palette.secondary[100],
         background: theme.brand.white[400],
         cursor: "pointer",
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

interface Props {
   speakers?: Speaker[]
   title?: string
   onClick?: () => void
}

const Speakers: FC<Props> = ({ speakers, title = "Speakers", ...props }) => {
   if (!speakers) {
      return null
   }

   return (
      <Box sx={styles.root}>
         {title ? <SectionTitle>{title}</SectionTitle> : null}
         <HorizontalScroll sx={styles.speakersWrapper}>
            {speakers.map((speaker) => (
               <SpeakerCard key={speaker.id} speaker={speaker} {...props} />
            ))}
         </HorizontalScroll>
      </Box>
   )
}

type SpeakerCardProps = {
   speaker: Speaker
   onClick?: () => void
}

const SpeakerCard: FC<SpeakerCardProps> = ({ speaker, onClick }) => {
   const { goToSpeakerDetails } = useLiveStreamDialog()
   const displayName = `${speaker.firstName ?? ""} ${speaker.lastName ?? ""}`

   return (
      <BrandedTooltip
         title={`See more about ${speaker.firstName ?? ""} ${
            speaker.lastName ?? ""
         }`}
         enterDelay={2000}
      >
         <Stack
            spacing={1}
            direction="row"
            sx={styles.speakerWrapper}
            onClick={() => {
               onClick && onClick()
               goToSpeakerDetails(speaker.id)
            }}
         >
            <Box minWidth={48} minHeight={48}>
               <Image
                  className="avatar"
                  width={48}
                  height={48}
                  src={
                     getResizedUrl(speaker.avatar, "lg") || speakerPlaceholder
                  }
                  objectFit="cover"
                  alt={displayName}
                  draggable={false}
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
      </BrandedTooltip>
   )
}

const SpeakerCardSkeleton: FC = () => {
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
               <Skeleton width={160} />
            </Typography>
            <Typography
               sx={styles.position}
               whiteSpace="nowrap"
               variant="small"
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
         <Stack sx={styles.speakersWrapper} direction="row" spacing={1}>
            {Array.from({ length: 3 }).map((_, i) => (
               <SpeakerCardSkeleton key={i} />
            ))}
         </Stack>
      </Box>
   )
}

export default Speakers
