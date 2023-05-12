import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { FC } from "react"
import Box from "@mui/material/Box"
import {
   InPersonEventBadge,
   LimitedRegistrationsBadge,
} from "../../../common/NextLivestreams/GroupStreams/groupStreamCard/badges"
import WhiteTagChip from "../../../common/chips/TagChip"
import LanguageIcon from "@mui/icons-material/Language"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import { sxStyles } from "../../../../../types/commonTypes"
import Skeleton from "@mui/material/Skeleton"
import { useFirestoreCollection } from "../../../../custom-hook/utils/useFirestoreCollection"
import { collection, query, where } from "firebase/firestore"
import { Interest } from "@careerfairy/shared-lib/interests"
import { FirestoreInstance } from "../../../../../data/firebase/FirebaseInstance"

const styles = sxStyles({
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
      borderRadius: 2,
      borderWidth: 1,
      height: "1.4rem",
      margin: "0.3em !important",
      "& svg": {
         fontSize: "1.1rem",
      },
      "& span": {
         px: 1,
         fontSize: "0.7rem",
      },
   },
})

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

export const LivestreamTagsContainerSkeleton = () => {
   return (
      <Box sx={styles.tagsWrapper}>
         <InterestSkeletons />
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

const InterestSkeletons: FC = () => {
   return (
      <>
         <Skeleton
            sx={styles.chip}
            variant={"rectangular"}
            height={20}
            width={100}
         />
         <Skeleton
            sx={styles.chip}
            variant={"rectangular"}
            height={20}
            width={150}
         />
         <Skeleton
            sx={styles.chip}
            variant={"rectangular"}
            height={20}
            width={45}
         />
      </>
   )
}

export default LivestreamTagsContainer
