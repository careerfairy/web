import { FC, memo, useEffect, useState } from "react"
import BaseDialogView, { HeroContent } from "../BaseDialogView"
import { useLiveStreamDialog } from "../LivestreamDialog"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import { sxStyles } from "../../../../types/commonTypes"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import Image from "next/image"
import {
   InPersonEventBadge,
   LimitedRegistrationsBadge,
} from "../../common/NextLivestreams/GroupStreams/groupStreamCard/badges"
import WhiteTagChip from "../../common/chips/TagChip"
import LanguageIcon from "@mui/icons-material/Language"
import { useFirestoreCollection } from "../../../custom-hook/utils/useFirestoreCollection"
import { collection, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../../data/firebase/FirebaseInstance"
import { Interest } from "../../../../types/interests"
import { alpha } from "@mui/material/styles"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { SuspenseWithBoundary } from "../../../ErrorBoundary"
import DateUtil from "../../../../util/DateUtil"
import { Divider } from "@mui/material"
import { isEmpty } from "lodash/fp"

const styles = sxStyles({
   root: {},
   eventTitle: {
      fontWeight: 600,
      textAlign: "center",
      maxWidth: 750,
   },
   logoWrapper: {
      p: 1,
      background: "white",
      borderRadius: 4,
      display: "flex",
   },
   companyNameWrapper: {
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
   },
   tagsWrapper: {
      display: "flex",
      flexWrap: "wrap",
      "& .MuiChip-root": {
         margin: {
            xs: 0.5,
            md: 1,
         },
         marginLeft: 0,
      },
      justifyContent: "center",
   },
   chip: {
      backgroundColor: "rgba(251, 251, 251, 0.2)",
      borderRadius: {
         xs: 2,
         // sm: 3.5,
      },
      borderWidth: 1,
      height: "1.4rem",
      margin: { xs: "0.6em" },
      "& svg": {
         fontSize: "1.1rem",
      },
      "& span": {
         px: 1,
         fontSize: "0.7rem",
      },
   },
   date: {
      fontWeight: 500,
   },
   divider: {
      borderColor: (theme) => alpha(theme.palette.common.white, 0.3),
      width: "95%",
      mx: "auto !important",
   },

   // Timer
   countDownWrapper: {
      flexWrap: "nowrap",
      display: "flex",
      justifyContent: "space-around",
      width: "100%",
   },
   timeElement: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   timeType: {
      fontWeight: 400,
      fontSize: "0.75rem",
   },
   timeLeft: {
      fontWeight: 700,
   },
})

const LivestreamDetailsView: FC = () => {
   const { livestream, livestreamPresenter } = useLiveStreamDialog()

   if (!livestream) return <LivestreamDetailsViewSkeleton />

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
                  <Typography
                     variant={"h2"}
                     component="h1"
                     sx={styles.eventTitle}
                  >
                     {livestream.title}
                  </Typography>
                  <LivestreamTagsContainer presenter={livestreamPresenter} />
                  <CountDownTimer presenter={livestreamPresenter} />
               </Stack>
            </HeroContent>
         }
      />
   )
}

const TimerText = memo(function TimerText({ time }: { time: Date }) {
   const calculateTimeLeft = () => DateUtil.calculateTimeLeft(time)

   const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

   useEffect(() => {
      const timeout = setTimeout(() => {
         const newTimeLeft = calculateTimeLeft()
         setTimeLeft(newTimeLeft)
      }, 1000)
      return () => clearTimeout(timeout)
   })

   if (isEmpty(timeLeft)) return null

   return (
      <Box sx={styles.countDownWrapper}>
         {Object.keys(timeLeft).map((interval, index) => (
            <Box key={index} sx={styles.timeElement}>
               <Typography variant="h5" sx={styles.timeLeft}>
                  {timeLeft[interval]}
               </Typography>
               <Typography variant="body1" sx={styles.timeType}>
                  {interval}
               </Typography>
            </Box>
         ))}
      </Box>
   )
})

type CountdownTimerProps = {
   presenter: LivestreamPresenter
}
const CountDownTimer: FC<CountdownTimerProps> = ({ presenter }) => {
   return (
      <Stack spacing={1} divider={<Divider sx={styles.divider} />}>
         <Typography sx={styles.date} variant={"body1"} textAlign={"center"}>
            {DateUtil.formatLiveDate(presenter.start)}
         </Typography>
         <TimerText time={presenter.start} />
      </Stack>
   )
}

type HostInfoProps = {
   presenter: LivestreamPresenter
}
const HostInfo: FC<HostInfoProps> = ({ presenter }) => {
   return (
      <Stack spacing={1.5} direction="row">
         <Box sx={styles.logoWrapper}>
            <Image
               src={getResizedUrl(presenter.companyLogoUrl, "lg")}
               width={50}
               height={50}
               objectFit={"contain"}
               alt={presenter.company}
            />
         </Box>
         <Box sx={styles.companyNameWrapper}>
            <Typography fontWeight={300} variant={"body1"}>
               Hosted by
            </Typography>
            <Typography fontWeight={600} variant={"h5"}>
               {presenter.company}
            </Typography>
         </Box>
      </Stack>
   )
}

type LivestreamTagsContainerProps = {
   presenter: LivestreamPresenter
}
const LivestreamTagsContainer: FC<LivestreamTagsContainerProps> = ({
   presenter,
}) => {
   return (
      <Box sx={styles.tagsWrapper}>
         {presenter.isFaceToFace ? (
            <InPersonEventBadge sx={styles.chip} white />
         ) : null}
         {presenter.maxRegistrants ? (
            <LimitedRegistrationsBadge
               sx={styles.chip}
               white
               numberOfSpotsRemaining={presenter.getNumberOfSpotsRemaining()}
            />
         ) : null}
         {presenter.language ? (
            <WhiteTagChip
               sx={styles.chip}
               icon={<LanguageIcon />}
               variant={"outlined"}
               tooltipText={`This event is in ${presenter.language.name}`}
               label={presenter.language.name}
            />
         ) : null}
         <SuspenseWithBoundary fallback={<InterestSkeletons />}>
            <InterestChips interestIds={presenter.interestsIds} />
         </SuspenseWithBoundary>
      </Box>
   )
}

type InterestChipsProps = {
   interestIds: string[]
}

const maxInterestsToShow = 2

const InterestChips: FC<InterestChipsProps> = ({ interestIds }) => {
   const { data: interests } = useInterestsByIds(interestIds)

   // Calculate the number of remaining interests
   const remainingInterests = interests.length - maxInterestsToShow

   // Slice the interests array to only contain the first two interests
   const shownInterests = interests.slice(0, maxInterestsToShow)

   const notShownInterests = interests.slice(maxInterestsToShow)

   return (
      <>
         {shownInterests.map((interest) => (
            <WhiteTagChip
               key={interest.id}
               sx={styles.chip}
               variant={"outlined"}
               label={interest.name}
            />
         ))}
         {remainingInterests > 0 && (
            <WhiteTagChip
               sx={styles.chip}
               variant={"outlined"}
               label={`+${remainingInterests}`}
               tooltipText={notShownInterests
                  .map((interest) => interest.name)
                  .join(", ")}
            />
         )}
      </>
   )
}

const InterestSkeletons: FC = () => {
   return (
      <>
         <Skeleton sx={styles.chip} variant={"rectangular"} width={100} />
         <Skeleton sx={styles.chip} variant={"rectangular"} width={150} />
         <Skeleton sx={styles.chip} variant={"rectangular"} width={45} />
      </>
   )
}

/**
 * Returns a collection of interests based on their IDs.
 * @param ids Array of interest IDs to be fetched (max 10).
 * @returns Firestore collection containing interests.
 * @remarks Firebase will throw an error with the "in" operator if the passed array is empty, which is why it defaults to ["-"] when no ids are passed.
 */
const useInterestsByIds = (ids: string[]) => {
   return useFirestoreCollection<Interest>(
      query(
         collection(FirestoreInstance, "interests"),
         where("__name__", "in", ids?.length ? ids : ["-"])
      )
   )
}

const LivestreamDetailsViewSkeleton = () => {
   return (
      <BaseDialogView
         heroContent={
            <HeroContent>
               <Typography variant={"h1"} sx={styles.eventTitle}>
                  <Skeleton width={"100%"} />
                  <Skeleton width={"50%"} />
               </Typography>
            </HeroContent>
         }
      />
   )
}

export default LivestreamDetailsView
