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
   interests: any[]
}
const LivestreamTagsContainer = ({
   language,
   interests,
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
         {interests?.length > 0 ? (
            <InterestChips interests={interests} />
         ) : (
            <TagsSkeleton />
         )}
      </Box>
   )
}

const TagsSkeleton = () => {
   return (
      <Box sx={styles.tagsWrapper}>
         <InterestSkeletons />
      </Box>
   )
}

type InterestChipsProps = {
   interests: any[]
}

const maxInterestsToShow = 2

const InterestChips = ({ interests }: InterestChipsProps) => {
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

const InterestSkeletons = () => {
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
