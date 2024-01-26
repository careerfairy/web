import { SparkStats } from "../../sparks/sparks"

export class RankedSpark {
   public points: number
   public id: string

   constructor(public model: SparkStats) {
      this.model = model
      this.id = model.id
      // Divide popularity by the median value and ensure the minimum value is 1
      this.points = model?.popularity
         ? model.popularity / 120 < 1
            ? 1
            : model.popularity / 120
         : 1
   }

   getId(): string {
      return this.id
   }

   getCompanyCountryId(): string {
      return this.model.companyCountry.id
   }

   getCompanyIndustryIds(): string[] {
      return this.model.companyIndustries.map((e) => e.id)
   }

   getCompanySize(): string {
      return this.model.companySize
   }

   getCategoryId(): string {
      return this.model.category.id
   }

   getCompanyTargetCountriesIds(): string[] {
      return this.model.spark.group?.targetedCountries.map((e) => e.id) || []
   }

   getCompanyTargetFieldsOfStudyIds(): string[] {
      return (
         this.model.spark.group?.targetedFieldsOfStudy.map((e) => e.id) || []
      )
   }

   getCompanyTargetUniversityCountryIds(): string[] {
      return (
         this.model.spark.group?.targetedUniversities.map((e) => e.country) ||
         []
      )
   }

   getCompanyTargetUniversityIds(): string[] {
      return this.model.spark.group?.targetedUniversities.map((e) => e.id) || []
   }

   static create(sparkStats: SparkStats) {
      return new RankedSpark(sparkStats)
   }

   addPoints(points: number) {
      this.points += points
   }

   getPoints() {
      return this.points
   }

   removePoints(points: number) {
      this.points -= points
   }
}

export function sortRankedSparksByPoints(
   rankedLivestreamEvents: RankedSpark[]
): RankedSpark[] {
   return [...rankedLivestreamEvents].sort(
      (a, b) => b.getPoints() - a.getPoints()
   )
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

export function getMostCommonArrayValues<T>(
   arrayValue: T[],
   getter: (spark: T) => string[]
): string[] {
   const values = arrayValue.flatMap((spark) => getter(spark)).filter(Boolean)

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
