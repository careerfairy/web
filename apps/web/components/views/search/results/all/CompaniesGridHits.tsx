import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import { Box, Grid } from "@mui/material"
import { useEffect, useMemo } from "react"
import { useInfiniteHits, useInstantSearch } from "react-instantsearch"
import { CompanyAlgoliaHit, CompanySearchResult } from "types/algolia"
import { sxStyles } from "types/commonTypes"
import { deserializeAlgoliaSearchResponse } from "util/algolia"
import CompanyCard from "../../../companies/CompanyCard"
import { SectionTitle } from "./SectionTitle"
import { ShowMoreButton } from "./ShowMoreButton"

const styles = sxStyles({
   gridSection: {
      mb: 4,
   },
   grid: {
      mt: 0,
   },
   flexItem: {
      display: "flex",
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

type CompaniesGridHitsProps = {
   onResultsUpdate: (count: number, hasHits: boolean) => void
}

export const CompaniesGridHits = ({
   onResultsUpdate,
}: CompaniesGridHitsProps) => {
   const { items, results, isLastPage, showMore } =
      useInfiniteHits<CompanyAlgoliaHit>()
   const { status } = useInstantSearch()

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
      ) as CompanySearchResult[]
   }, [items])

   if (deserializedItems.length === 0) return null

   return (
      <Box sx={styles.gridSection}>
         <SectionTitle title="Companies" />

         <Grid container spacing={2} sx={styles.grid}>
            {deserializedItems.map((company) => (
               <Grid
                  key={company.id}
                  xs={12}
                  sm={6}
                  lg={4}
                  xl={3}
                  item
                  sx={styles.flexItem}
               >
                  <CompanyCard
                     company={company}
                     interactionSource={
                        InteractionSources.Portal_Page_Search_Results
                     }
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
