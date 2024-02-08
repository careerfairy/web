import { Identifiable } from "../commonTypes"
import { RankedLivestreamEvent } from "./livestreams/RankedLivestreamEvent"
import { RankedSpark } from "./sparks/RankedSpark"

type RankedType = RankedLivestreamEvent | RankedSpark

export const sortRankedByPoints = <T extends RankedType>(
   rankedElements: T[]
): T[] => {
   return [...rankedElements].sort((a, b) => b.getPoints() - a.getPoints())
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
