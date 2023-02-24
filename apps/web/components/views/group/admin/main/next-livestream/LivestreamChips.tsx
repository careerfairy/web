import { Interest } from "@careerfairy/shared-lib/interests"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Grid, Skeleton, useMediaQuery, useTheme } from "@mui/material"
import { useInterests } from "components/custom-hook/useCollection"
import WhiteTagChip from "components/views/common/chips/TagChip"
import { useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import LanguageIcon from "@mui/icons-material/Language"

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
   const { data: existingInterests, isLoading } = useInterests()

   // match the event interests with the existing ones
   const eventInterests = useMemo(() => {
      if (isLoading) return []

      return existingInterests.filter((i) =>
         livestream.interestsIds?.includes(i.id)
      )
   }, [livestream.interestsIds, existingInterests, isLoading])

   if (isLoading) {
      return <Skeleton variant="text" />
   }

   return <ChipsLine livestream={livestream} eventInterests={eventInterests} />
}

const ChipsLine = ({
   livestream,
   eventInterests,
}: {
   livestream: LivestreamEvent
   eventInterests: Interest[]
}) => {
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
      <Grid item xs={12} mt={2}>
         {livestream?.language?.code ? (
            <WhiteTagChip
               icon={<LanguageIcon />}
               variant="filled"
               tooltipText={`This event is in ${livestream?.language.name}`}
               label={livestream?.language.code.toUpperCase()}
               sx={styles.chip}
            />
         ) : undefined}

         {eventInterests.slice(0, chipsToDisplay - 1).map((interest) => (
            <WhiteTagChip
               key={interest.id}
               variant="filled"
               sx={styles.chip}
               label={interest.name}
            />
         ))}
         {eventInterests.length > chipsToDisplay && (
            <WhiteTagChip
               sx={styles.chip}
               variant="outlined"
               label={`+ ${eventInterests.length - 3}`}
            />
         )}
      </Grid>
   )
}
