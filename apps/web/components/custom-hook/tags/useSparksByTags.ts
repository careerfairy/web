import { GroupedTags } from "@careerfairy/shared-lib/constants/tags"
import { SPARK_REPLICAS } from "@careerfairy/shared-lib/sparks/search"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { useSparkSearchAlgolia } from "../spark/useSparkSearchAlgolia"

/**
 * TODO: documentation
 * @param tags
 * @param totalItems
 * @returns
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

   // return (data?.deserializedHits || [])
   const hasMorePages = data?.length && data.at(0)?.nbPages > data.length

   return {
      hasMorePages: hasMorePages,
      data: (data?.flatMap((page) => page.deserializedHits) || []).map(
         (hit) => hit as unknown as Spark
      ),
      setSize: setSize,
   }
}
