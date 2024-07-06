import { GroupedTags } from "@careerfairy/shared-lib/constants/tags"
import { SPARK_REPLICAS } from "@careerfairy/shared-lib/sparks/search"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { useSparkSearchAlgolia } from "../spark/useSparkSearchAlgolia"

/**
 * Fetches Sparks with the specified @field tags. The retrieval of the data is done solely via Algolia.
 * @param tags Tags information grouped in the different categories allowed for a tag, with each category being a map of
 * tag id resolving to the tag OptionGroup. All ids in the map for each category will be used for matching sparks data.
 * @param totalItems Total items to fetch, use in Algolia for item per page.
 * @returns Sparks data and additional page information for navigating to next pages.
 */
export const useSparksByTags = (tags: GroupedTags, totalItems?: number) => {
   const filters = {
      contentTopicsTagIds: Object.keys(tags.contentTopics),
      languageTagIds: Object.keys(tags.language),
   }

   const { data, setSize } = useSparkSearchAlgolia(
      "",
      {
         arrayFilters: filters,
         booleanFilters: {
            published: true,
            groupPublicSparks: true,
         },
      },
      totalItems,
      SPARK_REPLICAS.PUBLISHED_AT_DESC
   )
   const hasMorePages = data?.length && data.at(0)?.nbPages > data.length

   return {
      hasMorePages: hasMorePages,
      data: (data?.flatMap((page) => page.deserializedHits) || []).map(
         (hit) => hit as unknown as Spark
      ),
      setSize: setSize,
   }
}
