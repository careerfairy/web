import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams"
import { Box, Grid } from "@mui/material"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import { useEffect, useMemo } from "react"
import { useInfiniteHits, useInstantSearch } from "react-instantsearch"
import { LivestreamAlgoliaHit, LivestreamSearchResult } from "types/algolia"
import { sxStyles } from "types/commonTypes"
import { deserializeAlgoliaSearchResponse } from "util/algolia"
import { useSearchContext } from "../../SearchContext"
import { SectionTitle } from "./SectionTitle"
import { ShowMoreButton } from "./ShowMoreButton"

const styles = sxStyles({
   gridSection: {
      mb: 4,
   },
   grid: {
      mt: 0,
   },
   loadMoreButton: {
      mt: 3,
      width: "100%",
   },
   loader: {
      display: "flex",
      justifyContent: "center",
      py: 4,
   },
})

type LivestreamsGridHitsProps = {
   onResultsUpdate: (count: number, hasHits: boolean) => void
}

export const LivestreamsGridHits = ({
   onResultsUpdate,
}: LivestreamsGridHitsProps) => {
   const { items, results, isLastPage, showMore } =
      useInfiniteHits<LivestreamAlgoliaHit>()
   const { handleOpenLivestreamDialog } = useSearchContext()
   const { status } = useInstantSearch()

   // Update parent with results count
   useEffect(() => {
      if (results) {
         onResultsUpdate(results.nbHits, items.length > 0)
      }
   }, [results, items.length, onResultsUpdate])

   const deserializedItems = useMemo(() => {
      return items.map((item) =>
         deserializeAlgoliaSearchResponse(item)
      ) as LivestreamSearchResult[]
   }, [items])

   if (deserializedItems.length === 0) return null

   return (
      <Box sx={styles.gridSection}>
         <SectionTitle title="Live streams" />

         <Grid container spacing={2} sx={styles.grid}>
            {deserializedItems.map((event, index) => (
               <Grid key={event.id} xs={12} sm={6} lg={4} xl={3} item>
                  <EventPreviewCard
                     event={event as any}
                     index={index}
                     totalElements={deserializedItems.length}
                     location={ImpressionLocation.portalSearchResults}
                     onCardClick={(e) => {
                        e.preventDefault()
                        handleOpenLivestreamDialog(event.id)
                     }}
                  />
               </Grid>
            ))}
         </Grid>

         {!isLastPage && (
            <Box sx={styles.loadMoreButton}>
               <ShowMoreButton
                  onClick={showMore}
                  loading={status === "loading" || status === "stalled"}
               />
            </Box>
         )}
      </Box>
   )
}
