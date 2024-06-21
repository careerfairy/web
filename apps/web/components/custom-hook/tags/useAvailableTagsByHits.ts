import { TagValues } from "@careerfairy/shared-lib/constants/tags"
import { useTagsContentHits } from "./useTagsContentHits"

export const useAvailableTagsByHits = () => {
   const { data: hits } = useTagsContentHits()

   console.log("🚀 ~ CategoryTagsChips ~ tagsContentHits:", hits)
   // Hook to get used tags by content
   const availableCategories = TagValues.filter((tag) => {
      // is business function
      if (hits.businessFunctions.hits[tag.id]) {
         return hits.businessFunctions.hits[tag.id].count.livestreams > 5
      }
      if (hits.contentTopics.hits[tag.id]) {
         return (
            hits.businessFunctions.hits[tag.id].count.livestreams > 5 &&
            hits.businessFunctions.hits[tag.id].count.sparks > 5
         )
      }
      if (hits.languages.hits[tag.id]) {
         return (
            hits.businessFunctions.hits[tag.id].count.livestreams > 5 &&
            hits.businessFunctions.hits[tag.id].count.sparks > 5
         )
      }
   })

   return availableCategories
}
