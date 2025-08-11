import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { Box } from "@mui/material"
import { SparksCarousel } from "components/views/sparks/components/SparksCarousel"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo } from "react"
import { useHits } from "react-instantsearch"
import { SparkAlgoliaHit, SparkSearchResult } from "types/algolia"
import { sxStyles } from "types/commonTypes"
import { deserializeAlgoliaSearchResponse } from "util/algolia"
import { useSearchContext } from "../../SearchContext"
import { SectionTitle } from "./SectionTitle"

const styles = sxStyles({
   carouselSection: {
      mb: 2,
   },
})

type SparksCarouselHitsProps = {
   onResultsUpdate: (count: number, hasHits: boolean) => void
}

export const SparksCarouselHits = ({
   onResultsUpdate,
}: SparksCarouselHitsProps) => {
   const { items, results } = useHits<SparkAlgoliaHit>()
   const router = useRouter()
   const { getFilterValues } = useSearchContext()

   const deserializedItems = useMemo(() => {
      return items.map((item) =>
         deserializeAlgoliaSearchResponse(item)
      ) as SparkSearchResult[]
   }, [items])

   // Update parent with results count
   useEffect(() => {
      if (results) {
         onResultsUpdate(results.nbHits, deserializedItems.length > 0)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [results, deserializedItems.length])

   const handleSparkClick = useCallback(
      (spark) => {
         if (!spark) return

         // Get current filter values
         const searchTerm = getFilterValues("q")[0] || ""
         const selectedLanguages = getFilterValues("languages")
         const selectedContentTopics = getFilterValues("contentTopicIds")
         const selectedCompanySizes = getFilterValues("companySizes")
         const selectedIndustries = getFilterValues("industries")

         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         const { sparkId, ...currentQuery } = router.query
         const query: Record<string, string | string[]> = {
            ...currentQuery,
            interactionSource: SparkInteractionSources.PortalSearch,
         }

         if (selectedLanguages.length > 0) {
            query.languages = router.query.languages
         }
         if (selectedContentTopics.length > 0) {
            query.contentTopicIds = router.query.contentTopicIds
         }
         if (selectedCompanySizes.length > 0) {
            query.companySizes = router.query.companySizes
         }
         if (selectedIndustries.length > 0) {
            query.industries = router.query.industries
         }
         if (searchTerm) {
            query.q = router.query.q
         }

         router.push({
            pathname: `/sparks/${spark.id}`,
            query,
         })
      },
      [router, getFilterValues]
   )

   if (deserializedItems.length === 0) return null

   return (
      <Box sx={styles.carouselSection}>
         <SparksCarousel
            header={<SectionTitle title="Sparks" />}
            sparks={deserializedItems}
            handleSparksClicked={handleSparkClick}
         />
      </Box>
   )
}
