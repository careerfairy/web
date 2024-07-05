import { GroupedTags } from "@careerfairy/shared-lib/constants/tags"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { useSparkSearchAlgolia } from "../spark/useSparkSearchAlgolia"

/**
 * TODO: allow limit like useLivestreamsByTags
 * @param tags
 * @returns
 */
export const useSparksByTags = (
   tags: GroupedTags,
   totalItems?: number
): Spark[] => {
   // TODO: pass total items per page
   console.log("🚀 ~ useSparksByTags -> tags:", tags)
   const { data } = useSparkSearchAlgolia(
      "",
      {
         arrayFilters: {
            contentTopicsTagIds: Object.keys(tags.contentTopics),
            languageTagIds: Object.keys(tags.language),
         },
      },
      totalItems
   )

   return (data?.deserializedHits || []).slice(0, totalItems)
}
