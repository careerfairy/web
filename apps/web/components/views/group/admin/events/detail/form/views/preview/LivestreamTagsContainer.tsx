import { TagValuesLookup } from "@careerfairy/shared-lib/constants/tags"
import { LivestreamLanguage } from "@careerfairy/shared-lib/livestreams"
import { sxStyles } from "@careerfairy/shared-ui"
import Box from "@mui/material/Box"
import WhiteTagChip from "components/views/common/chips/TagChip"
import StaticSkeleton from "./StaticSkeleton"

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
   language: LivestreamLanguage
   businessFunctions: string[]
   contentTopics: string[]
}
const LivestreamTagsContainer = ({
   language,
   businessFunctions,
   contentTopics,
}: LivestreamTagsContainerProps) => {
   return (
      <Box sx={styles.tagsWrapper}>
         {language ? (
            <WhiteTagChip
               sx={styles.chip}
               variant={"outlined"}
               tooltipText={`This live stream is in ${language.name}`}
               label={language.name}
            />
         ) : (
            <LanguageSkeleton />
         )}
         {businessFunctions?.length > 0 ? (
            <TagChips tagIds={businessFunctions} />
         ) : (
            <TagsSkeleton />
         )}

         {contentTopics?.length > 0 ? (
            <TagChips tagIds={contentTopics} />
         ) : (
            <TagsSkeleton />
         )}
      </Box>
   )
}

const TagsSkeleton = () => {
   return (
      <Box sx={styles.tagsWrapper}>
         <TagSkeletons />
      </Box>
   )
}

type TagChipsProps = {
   tagIds: string[]
}

const maxTagsToShow = 2

const TagChips = ({ tagIds }: TagChipsProps) => {
   // Calculate the number of remaining tags
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

const LanguageSkeleton = () => {
   return (
      <StaticSkeleton
         sx={[styles.chip, styles.chipSkeleton]}
         variant={"rectangular"}
         height={20}
         width={100}
      />
   )
}

const TagSkeletons = () => {
   return (
      <>
         <StaticSkeleton
            sx={[styles.chip, styles.chipSkeleton]}
            variant={"rectangular"}
            height={20}
            width={100}
         />
         <StaticSkeleton
            sx={[styles.chip, styles.chipSkeleton]}
            variant={"rectangular"}
            height={20}
            width={150}
         />
         <StaticSkeleton
            sx={[styles.chip, styles.chipSkeleton]}
            variant={"rectangular"}
            height={20}
            width={45}
         />
      </>
   )
}

export default LivestreamTagsContainer
