import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import {
   ContentHitsCount,
   GroupedOptionGroup,
   TagValues,
   groupTags,
} from "@careerfairy/shared-lib/constants/tags"
import { UserData } from "@careerfairy/shared-lib/users"
import { useAuth } from "HOCs/AuthProvider"
import { useTagsContentHits } from "./useTagsContentHits"

/**
 * TODO: Add additional docs, and could be moved to to CF
 * @returns
 */
export const useAvailableTagsByHits = () => {
   const { isLoggedIn, userData } = useAuth()
   const { data: hits } = useTagsContentHits()

   const availableCategories = TagValues.filter((tag) => {
      if (hits.businessFunctions.hits[tag.id]) {
         return shouldShowTagByCount(
            hits.businessFunctions.hits[tag.id].count,
            6
         )
      }
      if (hits.contentTopics.hits[tag.id]) {
         return shouldShowTagByCount(
            hits.contentTopics.hits[tag.id].count,
            6,
            6
         )
      }
      if (hits.languages.hits[tag.id]) {
         return shouldShowTagByCount(hits.languages.hits[tag.id].count, 6, 6)
      }
   })

   const tags = sortByUserInterests(availableCategories, userData, isLoggedIn)
   return tags
}

const sortByUserInterests = (
   tags: OptionGroup[],
   user: UserData,
   isLoggedIn: boolean
): OptionGroup[] => {
   const groupedTags = groupTags(tags.map((t) => t.id))

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

   const sortedBusinessFunctions = sortTags(
      businessFunctionTagIds,
      businessFunctionsGetter
   )
   const sortedContentTopics = sortTags(contentTopicTagIDs, contentTopicsGetter)
   const sortedLanguages = sortTags(languageTagIds, languagesGetter)

   if (!isLoggedIn) {
      return sortedContentTopics
         .concat(sortedBusinessFunctions)
         .concat(sortedLanguages)
   }
   const businessFunctions = sortTagsByUserData(
      () => businessFunctionTagIds,
      () => user.businessFunctionsTagIds || [],
      createGroupedOptionGroupGetter(groupedTags.businessFunctions)
   )
   const contentTopics = sortTagsByUserData(
      () => contentTopicTagIDs,
      () => user.contentTopicsTagIds || [],
      createGroupedOptionGroupGetter(groupedTags.contentTopics)
   )
   const languages = sortedLanguages

   return contentTopics.concat(businessFunctions).concat(languages)
}

const createGroupedOptionGroupGetter = (
   data: GroupedOptionGroup
): ((tagId: string) => OptionGroup) => {
   return (tagId: string) => data[tagId]
}

const sortTags = (
   tagIds: string[],
   optionGroupGetter: (tagId) => OptionGroup
): OptionGroup[] => {
   return tagIds.map(optionGroupGetter).sort(alphabeticalSort)
}

/**
 * TODO: Update docs, using getters to not call maps again since the data already should exist by calling function
 * @param tagsGetter
 * @param userTagIdsGetter
 * @param optionGroupGetter
 * @returns
 */
const sortTagsByUserData = (
   tagsIdsGetter: () => string[],
   userTagIdsGetter: () => string[],
   optionGroupGetter: (tagId) => OptionGroup
): OptionGroup[] => {
   const tagIds = tagsIdsGetter()
   const userTagIds = userTagIdsGetter()

   const matchingTagIds = tagIds.filter((tagId) => userTagIds.includes(tagId))

   const matches = matchingTagIds.map(optionGroupGetter).sort(alphabeticalSort)

   const tagsWithoutUserMatch = tagIds
      .filter((tag) => !matchingTagIds.includes(tag))
      .map(optionGroupGetter)
      .sort(alphabeticalSort)

   return matches.concat(tagsWithoutUserMatch)
}

const alphabeticalSort = (tagA: OptionGroup, tagB: OptionGroup) =>
   tagA.name.localeCompare(tagB.name)

const shouldShowTagByCount = (
   hitsCount: ContentHitsCount,
   minEvents: number,
   minSparks?: number
): boolean => {
   return (
      hitsCount.livestreams >= minEvents &&
      (minSparks !== undefined ? hitsCount.sparks >= minSparks : true)
   )
}
