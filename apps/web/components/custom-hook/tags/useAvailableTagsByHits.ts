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
 * Retrieves all tags (see TagValues @packages/shared-lib/src/constants/tags.ts), according to the amount of times a specific
 * tag has been used. To determine how many hits each tag has, a custom cloud function (fetchTagsContentHits), which does this calculation via Algolia and
 * returns a map with all the counts and also grouping of the counts by content. Allowing this hook to apply the custom rule for defining if a tag should be selectable
 * or displayable.
 * @returns @type OptionGroup with all available tags for usage, based on rules according to content usage.
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
      businessFunctionTagIds,
      user?.businessFunctionsTagIds || [],
      createGroupedOptionGroupGetter(groupedTags.businessFunctions)
   )

   const contentTopics = sortTagsByUserData(
      contentTopicTagIDs,
      user?.contentTopicsTagIds || [],
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
 * Sorts a given set of tag ids, taken into consideration the tags which user has preference in his profile, meaning
 * these tags will take precedence when sorting and still will be sorted alphabetically.
 * - Example: User has tags [E,M,O] in his profile so the sorted list of all tags would be [E,M,O,A,B,C...].
 *
 * This function returns OptionGroup[] allowing for quick display with the labels, and for such it uses @param optionGroupGetter to
 * map the tag id to its OptionGroup value.
 * @param tagIds Ids of the tags to sort.
 * @param userTagIds Ids of user preferred tags.
 * @param optionGroupGetter Getter for mapping a tag id to its OptionGroup value.
 * @returns OptionGroup[]
 */
const sortTagsByUserData = (
   tagIds: string[],
   userTagIds: string[],
   optionGroupGetter: (tagId) => OptionGroup
): OptionGroup[] => {
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
