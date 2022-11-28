import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"

export class RankedLivestreamEvent {
   public points: number
   public id: string

   constructor(public model: LivestreamEvent) {
      this.model = model
      this.id = model.id
      this.points = 0 // Initial value could also be livestream.popularity once that field is added
   }

   static create(livestream: LivestreamEvent) {
      return new RankedLivestreamEvent(livestream)
   }

   getFieldOfStudyIds(): string[] {
      return this.model.targetFieldsOfStudy.map((e) => e.id)
   }

   getInterestIds(): string[] {
      return this.model.interestsIds || []
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
