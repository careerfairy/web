import { Identifiable } from "../commonTypes"
import { RankedCustomJob } from "../customJobs/RankedCustomJob"
import { RankedLivestreamEvent } from "./livestreams/RankedLivestreamEvent"
import { RankedSpark } from "./sparks/RankedSpark"

type RankedType = RankedLivestreamEvent | RankedSpark | RankedCustomJob

export const sortRankedByPoints = <T extends RankedType>(
   rankedElements: T[]
): T[] => {
   return [...rankedElements].sort((a, b) => {
      const diff = b.getPoints() - a.getPoints()
      if (diff !== 0) return diff
      // Deterministic tie-breaker: sort by id alphabetically
      return a.id.localeCompare(b.id)
   })
}

export const handlePromisesAllSettled = async <TPromiseResolve>(
   promises: Promise<TPromiseResolve>[],
   errorLogger: (...args: unknown[]) => void
): Promise<TPromiseResolve[]> => {
   const results = await Promise.allSettled(promises)
   const resolvedResults: TPromiseResolve[] = []

   results.forEach((result) => {
      if (result.status === "fulfilled") {
         resolvedResults.push(result.value)
      } else {
         errorLogger(result.reason)
      }
   })

   return resolvedResults
}

export const getMostCommonArrayValues = <T extends Identifiable>(
   arrayValue: T[],
   getter: (arrayValue: T) => string[]
): string[] => {
   const values = arrayValue
      .flatMap((arrayValue) => getter(arrayValue))
      .filter(Boolean)

   return sortElementsByFrequency(values)
}

export const sortElementsByFrequency = (elements: string[]) => {
   // count the number of times each element appears
   const elementCounts = elements.reduce<Record<string, number>>(
      (acc, element) => {
         acc[element] = acc[element] ? acc[element] + 1 : 1
         return acc
      },
      {}
   )

   // sort the elements by the number of times they appear
   return Object.entries(elementCounts)
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0])
}

export const filterByField = <K, T>(
   items: K[],
   getItem: (item: unknown) => T,
   fieldOrFn: keyof T | ((item: T) => unknown | unknown[]),
   filterValues: unknown | unknown[],
   limit?: number
): K[] => {
   const values = Array.isArray(filterValues) ? filterValues : [filterValues]

   if (values.length === 0) {
      return []
   }

   const result: K[] = []

   for (const rawItem of items) {
      if (limit !== undefined && result.length >= limit) {
         break
      }

      const item = getItem(rawItem)
      // Determine the value(s) to compare: use function if provided, else field name
      let fieldValue: unknown
      if (typeof fieldOrFn === "function") {
         fieldValue = fieldOrFn(item)
      } else {
         fieldValue = item[fieldOrFn]
      }

      let isMatch = false
      if (fieldValue === null || fieldValue === undefined) {
         isMatch = false
      } else if (Array.isArray(fieldValue)) {
         isMatch = fieldValue.some((valueInArray) => {
            if (
               valueInArray &&
               typeof valueInArray === "object" &&
               "id" in valueInArray
            ) {
               return values.includes((valueInArray as { id: unknown }).id)
            }
            return values.includes(valueInArray)
         })
      } else if (
         typeof fieldValue === "object" &&
         fieldValue !== null &&
         "id" in fieldValue
      ) {
         isMatch = values.includes((fieldValue as { id: unknown }).id)
      } else if (typeof fieldValue !== "object") {
         isMatch = values.includes(fieldValue)
      }

      if (isMatch) {
         result.push(rawItem)
      }
   }

   return result
}

export const arrayToRecordById = <T extends Identifiable>(
   items: T[]
): Record<T["id"], T> => {
   return items.reduce<Record<T["id"], T>>((acc, item) => {
      acc[item.id] = item
      return acc
   }, {} as Record<T["id"], T>)
}
