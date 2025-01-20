import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import {
   BusinessFunctionsTagValues,
   ContentHitsCount,
   ContentTopicsTagValues,
   GroupedOptionGroup,
   getGroupedTags,
} from "@careerfairy/shared-lib/constants/tags"
import { UserData } from "@careerfairy/shared-lib/users"
import { useAuth } from "HOCs/AuthProvider"
import { useTagsContentHits } from "./useTagsContentHits"

/**
 * Retrieves all tags (see TagValues @packages/shared-lib/src/constants/tags.ts), according to the amount of times a specific
 * tag has been used. To determine how many hits each tag has, a custom cloud function (fetchTagsContentHits), which does this calculation via Algolia and
 * returns a map with all the counts and also grouping of the counts by content. Allowing this hook to apply the custom rule for defining if a tag should be selectable
 * or displayable.
 */
export const useAvailableTagsByHits = () => {
   const { isLoggedIn, userData } = useAuth()
   const { data, isLoading } = useTagsContentHits()

   const businessFunctionsHits = data?.businessFunctions.hits || []
   const contentTopicsHits = data?.contentTopics.hits || []

   const availableBusinessFunctions = BusinessFunctionsTagValues.filter(
      (tag) => {
         const tagHits = businessFunctionsHits[tag.id]
         return (
            tagHits && shouldShowBusinessFunctionTagByCount(tagHits.count, 6)
         )
      }
   )

   const availableContentTopics = ContentTopicsTagValues.filter((tag) => {
      const tagHits = contentTopicsHits[tag.id]
      return tagHits && shouldShowContentTopicTagByCount(tagHits.count, 6, 6)
   })

   const sortedTags = sortByUserInterests(
      [...availableBusinessFunctions, ...availableContentTopics],
      userData,
      isLoggedIn
   )

   return {
      tags: sortedTags,
      isLoading,
   }
}

const sortByUserInterests = (
   tags: OptionGroup[],
   user: UserData,
   isLoggedIn: boolean
): OptionGroup[] => {
   if (tags?.length === 0) return []

   const groupedTags = getGroupedTags(tags.map((t) => t.id))

   const businessFunctionsGetter = createGroupedOptionGroupGetter(
      groupedTags.businessFunctions
   )
   const contentTopicsGetter = createGroupedOptionGroupGetter(
      groupedTags.contentTopics
   )

   const languagesGetter = createGroupedOptionGroupGetter(groupedTags.language)

   const businessFunctionTagIds = Object.keys(
      groupedTags.businessFunctions || []
   )

   const contentTopicTagIDs = Object.keys(groupedTags.contentTopics || [])

   const languageTagIds = Object.keys(groupedTags.language || [])

   const sortedUserTags = sortTags(
      (user?.businessFunctionsTagIds || []).concat(
         user?.contentTopicsTagIds || []
      ),
      (tagId) => {
         if (businessFunctionTagIds.includes(tagId)) {
            return businessFunctionsGetter(tagId)
         } else {
            return contentTopicsGetter(tagId)
         }
      }
   ).filter(Boolean)

   const sortedBusinessFunctions = sortTags(
      businessFunctionTagIds.filter(
         (tagId) => !sortedUserTags.find((userTag) => userTag.id == tagId)
      ),
      businessFunctionsGetter
   )

   const sortedContentTopics = sortTags(
      contentTopicTagIDs.filter(
         (tagId) => !sortedUserTags.find((userTag) => userTag.id == tagId)
      ),
      contentTopicsGetter
   )

   const sortedLanguages = sortTags(languageTagIds, languagesGetter)

   if (!isLoggedIn) {
      return sortedContentTopics
         .concat(sortedBusinessFunctions)
         .concat(sortedLanguages)
   }

   return sortedUserTags
      .concat(sortedContentTopics)
      .concat(sortedBusinessFunctions)
      .concat(sortedLanguages)
}

const createGroupedOptionGroupGetter = (
   data: GroupedOptionGroup
): ((tagId: string) => OptionGroup) => {
   return (tagId: string) => data[tagId]
}

const sortTags = (
   tagIds: string[],
   optionGroupGetter: (tagId: string) => OptionGroup
): OptionGroup[] => {
   return tagIds.map(optionGroupGetter).sort(alphabeticalSort)
}

const alphabeticalSort = (tagA: OptionGroup, tagB: OptionGroup) =>
   tagA.name.localeCompare(tagB.name)

const shouldShowBusinessFunctionTagByCount = (
   hitsCount: ContentHitsCount,
   minEvents: number
): boolean => {
   return hitsCount.livestreams > minEvents
}

const shouldShowContentTopicTagByCount = (
   hitsCount: ContentHitsCount,
   minEvents: number,
   minSparks: number
): boolean => {
   return hitsCount.livestreams > minEvents && hitsCount.sparks > minSparks
}
