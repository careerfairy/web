import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams"
import { Box, Grid } from "@mui/material"
import { useAutoPlayGrid } from "components/custom-hook/utils/useAutoPlayGrid"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import { useEffect, useMemo } from "react"
import { useInfiniteHits, useInstantSearch } from "react-instantsearch"
import { InView } from "react-intersection-observer"
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

type RecordingsGridHitsProps = {
   onResultsUpdate: (count: number, hasHits: boolean) => void
}

export const RecordingsGridHits = ({
   onResultsUpdate,
}: RecordingsGridHitsProps) => {
   const { items, results, isLastPage, showMore } =
      useInfiniteHits<LivestreamAlgoliaHit>()
   const { handleOpenLivestreamDialog } = useSearchContext()
   const { status } = useInstantSearch()

   const {
      shouldDisableAutoPlay,
      moveToNextElement,
      ref: autoPlayRef,
      handleInViewChange,
      muted,
      setMuted,
   } = useAutoPlayGrid()

   // Update parent with results count
   useEffect(() => {
      if (results) {
         onResultsUpdate(results.nbHits, items.length > 0)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [results, items.length])

   const deserializedItems = useMemo(() => {
      return items.map((item) =>
         deserializeAlgoliaSearchResponse(item)
      ) as LivestreamSearchResult[]
   }, [items])

   if (deserializedItems.length === 0) return null

   return (
      <Box sx={styles.gridSection} ref={autoPlayRef}>
         <SectionTitle title="Recordings" />

         <Grid container spacing={2} sx={styles.grid}>
            {deserializedItems.map((event, index) => (
               <Grid key={event.id} xs={12} sm={6} lg={4} xl={3} item>
                  <InView triggerOnce>
                     {({ inView, ref }) =>
                        inView ? (
                           <EventPreviewCard
                              ref={ref}
                              event={event as any}
                              index={index}
                              totalElements={deserializedItems.length}
                              location={ImpressionLocation.portalSearchResults}
                              disableAutoPlay={shouldDisableAutoPlay(index)}
                              onGoNext={moveToNextElement}
                              onViewChange={handleInViewChange(index)}
                              muted={muted}
                              setMuted={setMuted}
                              onCardClick={(e) => {
                                 e.preventDefault()
                                 handleOpenLivestreamDialog(event.id)
                              }}
                           />
                        ) : (
                           <EventPreviewCard ref={ref} loading />
                        )
                     }
                  </InView>
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
