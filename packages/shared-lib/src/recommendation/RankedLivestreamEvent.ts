import { FieldOfStudy } from "../fieldOfStudy"
import { LivestreamEvent } from "../livestreams"

export class RankedLivestreamEvent {
   public points: number
   public id: string

   constructor(public model: LivestreamEvent) {
      this.model = model
      this.id = model.id
      // Divide popularity by the median value and ensure the minimum value is 1
      this.points = model?.popularity
         ? model.popularity / 120 < 1
            ? 1
            : model.popularity / 120
         : 1
   }

   static create(livestream: LivestreamEvent) {
      return new RankedLivestreamEvent(livestream)
   }

   getFieldOfStudyIds(): string[] {
      return this.model.targetFieldsOfStudy.map((e) => e.id) || []
   }

   getInterestIds(): string[] {
      return this.model.interestsIds || []
   }

   getCompanyCountries(): string[] {
      return this.model.companyCountries || []
   }

   getCompanyIndustries(): string[] {
      return this.model.companyIndustries || []
   }

   getCompanySizes(): string[] {
      return this.model.companySizes || []
   }

   getLanguage(): string {
      return this.model.language.code || ""
   }

   addPoints(points: number) {
      this.points += points
   }

   // removePoints(points: number) {
   //    this.points -= points
   // }

   getPoints() {
      return this.points
   }
}

export function sortRankedLivestreamEventByPoints(
   rankedLivestreamEvents: RankedLivestreamEvent[]
): RankedLivestreamEvent[] {
   return [...rankedLivestreamEvents].sort(
      (a, b) => b.getPoints() - a.getPoints()
   )
}

export const handlePromisesAllSettled = async <TPromiseResolve>(
   promises: Promise<TPromiseResolve>[],
   errorLogger: (...args: any[]) => void
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

export function getMostCommonFieldsOfStudies(
   livestreams: LivestreamEvent[]
): FieldOfStudy[] {
   // get all fields of study from livestreams
   const fieldsOfStudy = livestreams
      .flatMap((livestream) => livestream.targetFieldsOfStudy)
      .filter(Boolean)

   const sortedFieldOfStudyIds = sortElementsByFrequency(
      fieldsOfStudy.map((fieldOfStudy) => fieldOfStudy.id)
   )

   // return the fields of study objects sorted by frequency
   return sortedFieldOfStudyIds.map((fieldOfStudyId) =>
      fieldsOfStudy.find((fieldOfStudy) => fieldOfStudy.id === fieldOfStudyId)
   )
}

export function getMostCommonArrayValues(
   livestreams: LivestreamEvent[],
   livestreamGetter: (livestream: LivestreamEvent) => string[]
): string[] {
   const values = livestreams
      .flatMap((livestream) => livestreamGetter(livestream))
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
