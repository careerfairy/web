import { TagValuesLookup } from "@careerfairy/shared-lib/constants/tags"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import { FC } from "react"
import { sxStyles } from "../../../../../types/commonTypes"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import {
   InPersonEventBadge,
   LimitedRegistrationsBadge,
} from "../../../common/NextLivestreams/GroupStreams/groupStreamCard/badges"
import WhiteTagChip from "../../../common/chips/TagChip"

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
   chipSkeleton: {
      backgroundColor: "rgba(0, 0, 0, 0.11)",
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
               variant={"outlined"}
               tooltipText={`This live stream is in ${presenter.language.name}`}
               label={presenter.language.name}
            />
         ) : null}

         {presenter.businessFunctionsTagIds.length > 0 ? (
            <SuspenseWithBoundary fallback={<TagSkeletons />}>
               <TagChips ids={presenter.businessFunctionsTagIds} />
            </SuspenseWithBoundary>
         ) : null}
         {presenter.contentTopicsTagIds.length > 0 ? (
            <SuspenseWithBoundary fallback={<TagSkeletons />}>
               <TagChips ids={presenter.contentTopicsTagIds} />
            </SuspenseWithBoundary>
         ) : null}
      </Box>
   )
}

export const LivestreamTagsContainerSkeleton = () => {
   return (
      <Box sx={styles.tagsWrapper}>
         <TagSkeletons />
      </Box>
   )
}

type TagChipsProps = {
   ids: string[]
}

const maxTagsToShow = 2

const TagChips: FC<TagChipsProps> = ({ ids: tagIds }) => {
   // Calculate the number of remaining tags to show
   const remainingTags = tagIds.length - maxTagsToShow

   // Slice the tag ids array to only contain the first two tags
   const shownTags = tagIds.slice(0, maxTagsToShow)

   const notShownTags = tagIds.slice(maxTagsToShow)

   return (
      <>
         {shownTags.map((tagId) => (
            <WhiteTagChip
               key={tagId}
               sx={styles.chip}
               variant={"outlined"}
               label={TagValuesLookup[tagId]}
            />
         ))}
         {remainingTags > 0 && (
            <WhiteTagChip
               sx={styles.chip}
               variant={"outlined"}
               label={`+${remainingTags}`}
               tooltipText={notShownTags
                  .map((tagId) => TagValuesLookup[tagId])
                  .join(", ")}
            />
         )}
      </>
   )
}

const TagSkeletons: FC = () => {
   return (
      <>
         <Skeleton
            sx={[styles.chip, styles.chipSkeleton]}
            variant={"rectangular"}
            height={20}
            width={100}
         />
         <Skeleton
            sx={[styles.chip, styles.chipSkeleton]}
            variant={"rectangular"}
            height={20}
            width={150}
         />
         <Skeleton
            sx={[styles.chip, styles.chipSkeleton]}
            variant={"rectangular"}
            height={20}
            width={45}
         />
      </>
   )
}

export default LivestreamTagsContainer
