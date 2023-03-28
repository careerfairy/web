import { normalizeAndRemoveNonAlphanumeric } from "@careerfairy/shared-lib/utils/search"
import parse from "autosuggest-highlight/parse"

/**
 * Matches all occurrences of the specified query within the text, returning an array of
 * start and end indices for each match.
 * @param {string} text - The text to search in.
 * @param {string} query - The query to search for.
 * @returns {Array<[number, number]>} - The array of start and end indices for each match.
 */
export const customMatch = (
   text: string,
   query: string
): [number, number][] => {
   const cleanedQuery = normalizeAndRemoveNonAlphanumeric(query)
   const cleanedText = normalizeAndRemoveNonAlphanumeric(text)

   const regex = new RegExp(cleanedQuery, "gi")
   const matches: [number, number][] = []
   let match

   while ((match = regex.exec(cleanedText)) !== null) {
      matches.push([match.index, match.index + match[0].length])

      // Move the lastIndex forward to avoid infinite loops
      if (regex.lastIndex === match.index) {
         regex.lastIndex++
      }
   }

   return matches
}

/**
 * Returns an array of objects containing text and whether it is highlighted or not,
 * based on the specified query.
 * @function
 * @param {string} text - The text to search within.
 * @param {string} query - The query to search for highlighting.
 * @returns {Array<{ text: string, highlight: boolean }>} - An array of objects containing
 * the original text and whether it is highlighted or not.
 */
export const getParts = (
   text: string,
   query: string
): {
   text: string
   highlight: boolean
}[] => {
   const matches = customMatch(text, query) || []
   return parse(text, matches)
}
