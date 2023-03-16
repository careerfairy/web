import { LivestreamEvent } from "../livestreams"

/**
 * Generates a ngram array from a string for a given n
 * Will lowercase the characters and remove any non-alphanumeric characters
 */
export const ngrams = (str: string, n: number): string[] => {
   const ngrams = new Set<string>()
   const s1 = (str || "").toLowerCase()

   for (let k = 0; k <= s1.length - n; k++) {
      ngrams.add(s1.substring(k, k + n))
   }

   return Array.from(ngrams)
}

/**
 * Generate an array of trigrams from a given string or an array of strings.
 * If the input string(s) exceed 500 characters, they will be trimmed to
 * the first 500 characters before computing the trigrams.
 *
 * @param str A string or an array of strings to compute trigrams from.
 * @returns An array of trigrams
 */
export const triGrams = (str: string | string[]): string[] => {
   let text: string[] = Array.isArray(str) ? str : [str]
   let parsed = text
      .filter((i) => i)
      // remove accents https://stackoverflow.com/a/37511463
      .map((s) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, ""))
      // remove non-alphanumeric characters (.,;:) etc
      .map((s) => s.replace(/[^a-zA-Z0-9 ]/g, ""))
      .join(" ")
      .trim()
      .slice(0, 500)

   return ngrams(parsed, 3)
}

/**
 * Generates a trigram map from a livestream event based on the it's title
 * and company name.
 *
 * Caution: if you change the way the trigrams are calculated
 * or concatenate a new field, all the existing trigrams (on the documents)
 * will be out of date and a migration is required to update them.
 */
export const livestreamTriGrams = (
   title: LivestreamEvent["title"],
   company: LivestreamEvent["company"]
): Record<string, true> => {
   const ngrams = triGrams([title, company])

   return ngrams.reduce((acc, triGram) => {
      acc[triGram] = true
      return acc
   }, {})
}
