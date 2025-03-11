import { TagValuesLookup } from "@careerfairy/shared-lib/constants/tags"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import LanguageIcon from "@mui/icons-material/Language"
import { Box, useMediaQuery, useTheme } from "@mui/material"
import WhiteTagChip from "components/views/common/chips/TagChip"
import { useMemo } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   chip: {
      color: (theme) => theme.palette.grey[600],
      borderColor: (theme) => theme.palette.grey[600],
      backgroundColor: "transparent",
      border: "1px solid grey",
      ".MuiChip-label": {
         fontWeight: 400,
      },
      marginRight: (t) => t.spacing(1),
   },
})

export const LivestreamChips = ({
   livestream,
}: {
   livestream: LivestreamEvent
}) => {
   return <ChipsLine livestream={livestream} />
}

const ChipsLine = ({ livestream }: { livestream: LivestreamEvent }) => {
   const theme = useTheme()
   const xl = useMediaQuery(theme.breakpoints.up("xl"))
   const xs = useMediaQuery(theme.breakpoints.down("sm"))

   // show more chips on larger screens
   const chipsToDisplay = useMemo(() => {
      if (xl) return 3
      if (xs) return 1

      return 2
   }, [xl, xs])

   return (
      <Box mt={{ xs: 1, sm: 2 }} display={"inline-flex"}>
         {livestream?.language?.code ? (
            <WhiteTagChip
               icon={<LanguageIcon />}
               variant="filled"
               tooltipText={`This stream is in ${livestream?.language.name}`}
               label={livestream?.language.code.toUpperCase()}
               sx={styles.chip}
            />
         ) : undefined}

         {livestream?.businessFunctionsTagIds ? (
            <EventTags
               tagIds={livestream.businessFunctionsTagIds}
               chipsToDisplay={chipsToDisplay}
            />
         ) : undefined}
         {!livestream?.businessFunctionsTagIds &&
         livestream?.contentTopicsTagIds ? (
            <EventTags
               tagIds={livestream.contentTopicsTagIds}
               chipsToDisplay={chipsToDisplay}
            />
         ) : undefined}
      </Box>
   )
}

type EventTagsProps = {
   tagIds: string[]
   chipsToDisplay: 1 | 2 | 3
}
const EventTags = ({ tagIds, chipsToDisplay }: EventTagsProps) => {
   return (
      <>
         {tagIds.slice(0, chipsToDisplay - 1).map((tagId) => (
            <WhiteTagChip
               key={tagId}
               variant="filled"
               sx={styles.chip}
               label={TagValuesLookup[tagId]}
            />
         ))}
         {tagIds.length > chipsToDisplay && (
            <WhiteTagChip
               sx={styles.chip}
               variant="outlined"
               label={`+ ${++tagIds.length - chipsToDisplay}`}
            />
         )}
      </>
   )
}
